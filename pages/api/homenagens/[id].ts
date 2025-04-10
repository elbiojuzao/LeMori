import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import { verifyToken } from '@/lib/authMiddleware'
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
  
  await dbConnect()

  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const userId = verifyToken(req, res)

      const homenagem = await Homenagem.findById(id)

      if (!homenagem) {
        return res.status(404).json({ error: 'Homenagem não encontrada' })
      }

      if (homenagem.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      res.status(200).json(homenagem)
    } catch (error) {
      console.error('Erro ao buscar homenagem:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.status(405).end()
  }
}
