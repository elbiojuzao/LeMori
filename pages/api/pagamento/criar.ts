import type { NextApiRequest, NextApiResponse } from 'next'
import { mp } from '@/lib/mercadopago'
import { Preference } from 'mercadopago/dist/clients/preference'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { items, total } = req.body

  const preference = new Preference(mp)

  try {
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: item._id,
          title: item.nome,
          quantity: item.quantidade,
          unit_price: Number(item.valor),
          currency_id: 'BRL',
        })),
        payer: {
          name: req.body.nome,
          email: req.body.email,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/erro`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/pendente`,
        },
        auto_return: 'approved',
      },
    })

    res.status(200).json({ id: result.id, init_point: result.init_point })
  } catch (err) {
    console.error('Erro ao criar preferência:', err)
    res.status(500).json({ error: 'Erro ao criar preferência de pagamento' })
  }
}