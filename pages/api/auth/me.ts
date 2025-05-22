import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'
import User from '@/models/User'

interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    const decoded = await verifyToken(token) as TokenPayload
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    const user = await User.findById(decoded.userId).select('-senha')
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    return res.status(200).json(user)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar usuário'
    return res.status(500).json({ message: errorMessage })
  }
}
