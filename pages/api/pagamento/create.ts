// pages/api/pagamento/create.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' })

  try {
    const { title, price, quantity, payer } = req.body

    const preference = await new Preference(client).create({
      items: [{
        id: 'homenagem_' + Math.random().toString(36).substring(2),
        title,
        quantity,
        unit_price: price,
        currency_id: 'BRL',
      }],
      payer: {
        email: payer.email,
        first_name: payer.first_name,
        last_name: payer.last_name,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/erro`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/pendente`,
      },
      auto_return: 'approved',
    })

    res.status(200).json({ preferenceId: preference.id })
  } catch (error) {
    console.error('Erro ao criar preferência:', error)
    res.status(500).json({ message: 'Erro ao criar preferência de pagamento' })
  }
}
