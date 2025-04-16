import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token inválido' })
  }

  await mongooseConnect()

  const user = await User.findOne({
    emailToken: token,
    emailTokenExpira: { $gt: new Date() }, // Verifica se o token não expirou
  })

  if (!user) {
    return res.status(400).json({ error: 'Token inválido ou expirado' })
  }

  user.emailVerificado = true
  user.emailToken = undefined
  user.emailTokenExpira = undefined
  await user.save()

  return res.status(200).json({ message: 'E-mail verificado com sucesso' })
}