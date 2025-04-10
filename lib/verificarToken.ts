import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'

export default function verificarToken(req: NextApiRequest, res: NextApiResponse): string {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({ message: 'Token não fornecido' })
    throw new Error('Token não fornecido')
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId
  } catch (error) {
    res.status(403).json({ message: 'Token inválido' })
    throw new Error('Token inválido')
  }
}
