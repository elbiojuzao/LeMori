import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import { verifyToken } from '@/lib/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        console.log('Token não fornecido')
        return res.status(401).json({ error: 'Token não fornecido' })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        console.log('Token inválido')
        return res.status(401).json({ error: 'Token inválido' })
      }

      const userId = decoded.userId

      const homenagem = await Homenagem.findById(id)
      if (!homenagem) {
        console.log('Homenagem não encontrada:', id)
        return res.status(404).json({ error: 'Homenagem não encontrada' })
      }

      if (!homenagem.criadoPor || homenagem.criadoPor.toString() !== userId) {
        console.log('Acesso negado - usuário não é o criador da homenagem')
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
