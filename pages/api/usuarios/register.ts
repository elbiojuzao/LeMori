import { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    await mongooseConnect()

    const { nome, email, senha, cpf } = req.body

    // Verifica se o usuário já existe
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado' })
    }

    // Cria hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10)

    // Cria novo usuário
    const user = await User.create({
      nome,
      email,
      senha: hashedPassword,
      cpf,
      homenagemCreditos: 0
    })

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        _id: user._id,
        nome: user.nome,
        email: user.email,
        cpf: user.cpf
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao registrar usuário'
    res.status(500).json({ message: errorMessage })
  }
} 