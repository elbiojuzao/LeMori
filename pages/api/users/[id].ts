import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect()

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  if (req.method === 'GET') {
    const { id } = req.query

    try {
      const user = await User.findById(id).lean()

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      return res.status(200).json(user)
    } catch (err) {
      console.error('Erro ao buscar usuário:', err)
      return res.status(500).json({ error: 'Erro ao buscar usuário' })
    }
  }

  return res.status(405).end()
}