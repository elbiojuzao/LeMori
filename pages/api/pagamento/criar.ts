import type { NextApiRequest, NextApiResponse } from 'next'
import { mp } from '@/lib/mercadopago'
import { Preference } from 'mercadopago/dist/clients/preference'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'
import ItemPedido from '@/models/ItemPedido'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { items, total, nome, email, endereco } = req.body

  // Validação básica dos itens e total
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Itens inválidos ou ausentes' })
  if (typeof total !== 'number' || total <= 0) return res.status(400).json({ error: 'Valor total inválido' })

  // Verificar autenticação
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  try {
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    await dbConnect()

    // Criar o pedido no banco de dados
    const pedido = new Pedido({
      userId: decoded.userId,
      statusPagamento: 'pendente',
      valorTotal: total,
      endereco: endereco,
    })

    // Salvar pedido no banco de dados
    const pedidoSalvo = await pedido.save()

    // Criar os itens do pedido
    const itensPedido = await Promise.all(
      items.map(async (item) => {
        const itemPedido = new ItemPedido({
          produtoId: item._id,
          nomeProduto: item.nome,
          quantidade: item.quantidade,
          valorUnitario: item.valor,
          pedidoId: pedidoSalvo._id,
          tipoItem: item.tipo || 'fisico'
        })
        return itemPedido.save()
      })
    )

    console.log('Pedido criado:', {
      pedidoId: pedidoSalvo._id,
      itens: itensPedido.map(item => ({
        nome: item.nomeProduto,
        quantidade: item.quantidade,
        valor: item.valorUnitario,
        tipo: item.tipoItem
      }))
    })

    // Criar preferência no Mercado Pago
    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        items: items.map((item: { _id: string, nome: string, quantidade: number, valor: number }) => ({
          id: item._id,
          title: item.nome,
          quantity: item.quantidade,
          unit_price: Number(item.valor),
          currency_id: 'BRL',
        })),
        payer: {
          name: nome,
          email: email,
        },
        external_reference: pedidoSalvo._id.toString(),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/erro`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/pendente`,
        },
        auto_return: 'approved',
      },
    })

    res.status(200).json({ id: result.id, init_point: result.init_point })
  } catch (error: unknown) {
    console.error('Erro ao processar pagamento:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar preferência de pagamento'
    res.status(500).json({ error: errorMessage })
  }
}