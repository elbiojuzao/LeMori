import type { NextApiRequest, NextApiResponse } from 'next'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Pedido from '@/models/Pedido'
import ItemPedido from '@/models/ItemPedido'
import Homenagem from '@/models/Homenagem'

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' })

  try {
    const { type, data } = req.body

    if (type === 'payment') {
      const payment = await new Payment(client).get({ id: data.id })

      if (payment.status !== 'approved') return res.status(200).send('Pagamento não aprovado, ignorado')

      const pedidoId = payment.external_reference

      await dbConnect()

      const pedido = await Pedido.findById(pedidoId)
      if (!pedido) return res.status(200).send('Pedido não encontrado, ignorado')
      
      pedido.statusPagamento = 'pago'
      await pedido.save()

      const itens = await ItemPedido.find({ pedidoId: pedido._id })
      const qtdHomenagens = itens.filter(item => item.tipo === 'homenagem').reduce((acc, item) => acc + item.quantidade, 0)

      if (qtdHomenagens > 0) {
        const user = await User.findById(pedido.userId)
        if (!user) return res.status(400).send('Usuário do pedido não encontrado')

          user.homenagensDisponiveis = (user.homenagensDisponiveis || 0) + qtdHomenagens
          await user.save()
      }
    }

    res.status(200).send('OK')
  } catch (error) {
    console.error('Erro no webhook:', error)
    res.status(500).send('Erro no webhook')
  }
}