import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nome, email, senha } = req.body

  await mongooseConnect()

  const userExistente = await User.findOne({ email })
  if (userExistente) {
    return res.status(400).json({ error: 'Usuário já cadastrado' })
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10)

  const novoUsuario = await User.create({ nome, email, senha: senhaCriptografada })

  res.status(201).json({ message: 'Usuário registrado com sucesso' })
}
