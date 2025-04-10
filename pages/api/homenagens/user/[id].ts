import { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import Homenagem from '@/models/Homenagem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const { id } = req.query

  try {
    await mongooseConnect()
    const homenagens = await Homenagem.find({ autor: id })
    return res.status(200).json(homenagens)
  } catch (err) {
    console.error('Erro ao buscar homenagens do usuário:', err)
    return res.status(500).json({ error: 'Erro ao buscar homenagens' })
  }
}