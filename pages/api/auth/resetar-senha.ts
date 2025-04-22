import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { token, novaSenha } = req.body

  if (!token || !novaSenha) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' })
  }

  await mongooseConnect()

  const user = await User.findOne({
    emailToken: token,
    emailTokenExpira: { $gt: new Date() }, // token ainda válido
  })

  if (!user) {
    return res.status(400).json({ error: 'Token inválido ou expirado.' })
  }

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10)

  user.senha = senhaCriptografada
  user.emailToken = undefined
  user.emailTokenExpira = undefined

  await user.save()

  return res.status(200).json({ message: 'Senha redefinida com sucesso. Você já pode fazer login.' })
}