import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' })
  }

  try {
    await mongooseConnect()

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' })
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha)
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Senha incorreta' })
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      token,
      usuario: {
        id: user._id,
        nome: user.nome,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}
