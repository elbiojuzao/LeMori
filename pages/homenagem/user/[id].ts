import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { id } = req.query

  if (req.method === 'GET') {
    const homenagem = await Homenagem.findById(id)
    if (!homenagem) return res.status(404).json({ error: 'Homenagem não encontrada' })

    return res.status(200).json(homenagem)
  }

  res.setHeader('Allow', ['GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
