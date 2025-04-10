import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

export function verifyToken(req: NextApiRequest, res: NextApiResponse): string {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' })
    throw new Error('Token não fornecido')
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' })
    throw new Error('Token inválido')
  }
}