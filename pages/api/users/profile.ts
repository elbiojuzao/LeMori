import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const SALT_ROUNDS = 10

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect()

  if (req.method === 'PUT') {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const token = authHeader.split(' ')[1]

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET)
      const userId = decoded.userId

      const { nome, senha } = req.body
      const updateData: { nome?: string; senhaHash?: string } = {}

      if (nome) {
        updateData.nome = nome
      }

      if (senha) {
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)
        updateData.senhaHash = senhaHash
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      ).select('nome email cpf')

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      return res.status(200).json({ message: 'Perfil atualizado com sucesso', user: updatedUser })
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      return res.status(401).json({ error: 'Token inválido ou erro na atualização' })
    }
  } else {
    return res.status(405).end()
  }
}