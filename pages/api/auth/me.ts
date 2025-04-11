import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    
    await mongooseConnect()
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.status(200).json(user)
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}
