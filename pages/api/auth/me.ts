import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect()

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const userId = decoded.userId

    if (req.method === 'GET') {
      const user = await User.findById(userId).select('nome cpf email homenagemCreditos isAdmin')
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }
      return res.status(200).json(user)
    }

    if (req.method === 'PUT') {
      const { nome } = req.body

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { nome },
        { new: true }
      )

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      return res.status(200).json({
        message: 'Dados do perfil atualizados com sucesso',
        user: updatedUser
      })
    }

    return res.status(405).end()
  } catch (err) {
    console.error('Erro no token ou operação:', err)
    return res.status(401).json({ error: 'Token inválido ou erro na operação' })
  }
}
