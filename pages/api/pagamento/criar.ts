import type { NextApiRequest, NextApiResponse } from 'next'
import { mp } from '@/lib/mercadopago'
import { Preference } from 'mercadopago/dist/clients/preference'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'
import ItemPedido from '@/models/ItemPedido'
import { verifyToken } from '@/lib/auth'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { items, total, endereco, shipping } = req.body

  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Itens inválidos ou ausentes' })

  if (typeof total !== 'number' || total <= 0)
    return res.status(400).json({ error: 'Valor total inválido' })

  if (typeof shipping !== 'number' || shipping < 0)
    return res.status(400).json({ error: 'Valor do frete inválido' })

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token não fornecido' })

  try {
    const decoded = await verifyToken(token)
    if (!decoded?.userId) return res.status(401).json({ message: 'Token inválido' })

    await dbConnect()

    const user = await User.findById(decoded.userId)
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // ⚠️ Itens com valor 0 podem invalidar a preferência
    const filteredItems = items.filter(item => Number(item.valor) > 0)

    // Criar o pedido no banco primeiro
    const pedido = new Pedido({
      userId: decoded.userId,
      dataCompra: new Date(),
      statusPagamento: 'pendente',
      statusPedido: 'pendente',
      valorTotal: total,
      endereco,
      itensFisico: filteredItems.some(item => item.isFisico),
      formaPagamento: req.body.paymentMethod || 'mercado-pago',
      idTransacao: 'pendente' // Será atualizado após criar a preferência
    })

    const pedidoSalvo = await pedido.save()

    // Criar itens no banco
    const itensPedido = await Promise.all(
      filteredItems.map(item => {
        const itemPedido = new ItemPedido({
          produtoId: item._id,
          nomeProduto: item.nome,
          quantidade: item.quantidade,
          valorUnitario: item.valor,
          pedidoId: pedidoSalvo._id,
          tipoItem: item.isFisico ? 'fisico' : 'homenagem'
        })
        return itemPedido.save()
      })
    )

    // Atualizar o pedido com os IDs dos itens
    pedidoSalvo.items = itensPedido.map(item => item._id)
    await pedidoSalvo.save()

    const preference = new Preference(mp)

    const preferenceData = {
      body: {
        items: filteredItems.map(item => ({
          id: item._id,
          title: item.nome,
          quantity: item.quantidade,
          unit_price: Number(item.valor),
          currency_id: 'BRL'
        })),
        payer: {
          name: user.nome || 'Comprador',
          email: user.email || 'comprador@email.com'
        },
        back_urls: {
          success: `${baseUrl}/pedidos/${pedidoSalvo._id}`,
          failure: `${baseUrl}/checkout`,
          pending: `${baseUrl}/pedidos/${pedidoSalvo._id}`
        },
        auto_return: "approved",
        external_reference: pedidoSalvo._id.toString(),
        notification_url: `${baseUrl}/api/pagamento/webhook`,
        shipments: {
          cost: shipping,
          mode: "not_specified"
        },
        statement_descriptor: "LEMORI",
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    }

    const result = await preference.create(preferenceData)

    if (!result?.id || !result?.init_point) {
      // Se falhar ao criar a preferência, remover o pedido e seus itens
      await ItemPedido.deleteMany({ pedidoId: pedidoSalvo._id })
      await Pedido.findByIdAndDelete(pedidoSalvo._id)
      return res.status(500).json({ error: 'Erro ao criar preferência de pagamento' })
    }

    // Atualizar o pedido com o ID da transação
    pedidoSalvo.idTransacao = result.id
    await pedidoSalvo.save()

    return res.status(200).json({ id: result.id, init_point: result.init_point })
  } catch (error) {
    console.error('Erro no criar.ts:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro ao criar preferência'
    })
  }
}
