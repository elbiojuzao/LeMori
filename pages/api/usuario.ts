import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect()

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token não fornecido' })

  const userId = verifyToken(token)
  if (!userId) return res.status(401).json({ message: 'Token inválido' })

  const user = await User.findById(userId).select('-password')
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

  if (req.method === 'GET') {
    return res.status(200).json(user)
  }

  if (req.method === 'PUT') {
    const { nome, email } = req.body
    if (!nome || !email) return res.status(400).json({ message: 'Nome e email são obrigatórios' })

    user.nome = nome
    user.email = email
    await user.save()

    return res.status(200).json({ message: 'Dados atualizados com sucesso', user })
  }

  return res.status(405).json({ message: 'Método não permitido' })
}
