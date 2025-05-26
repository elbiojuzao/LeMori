import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import UserModel from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    await mongooseConnect()

    const user = await UserModel.findById(decoded.userId)
      .select('nome email isAdmin foto')

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.status(200).json({
      _id: user._id,
      nome: user.nome,
      email: user.email,
      isAdmin: user.isAdmin || false,
      foto: user.foto || ''
    })
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar informações do usuário' })
  }
} 