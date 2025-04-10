import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, senha } = req.body

  await mongooseConnect()

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado' })
  }

  const senhaCorreta = await bcrypt.compare(senha, user.senha)
  if (!senhaCorreta) {
    return res.status(401).json({ error: 'Senha incorreta' })
  }

  const token = jwt.sign(
    { id: user._id, nome: user.nome, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return res.status(200).json({ token })
}
