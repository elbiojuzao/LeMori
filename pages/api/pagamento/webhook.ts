import type { NextApiRequest, NextApiResponse } from 'next'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' })

  try {
    const { type, data } = req.body

    if (type === 'payment') {
      const payment = await new Payment(client).get({ id: data.id })
      if (payment.status === 'approved') {
        const payerEmail = payment.payer?.email

        await dbConnect()
        const user = await User.findOne({ email: payerEmail })

        if (user) {
          user.homenagensDisponiveis = (user.homenagensDisponiveis || 0) + 1
          await user.save()
        }
      }
    }

    res.status(200).send('OK')
  } catch (error) {
    console.error('Erro no webhook:', error)
    res.status(500).send('Erro no webhook')
  }
}