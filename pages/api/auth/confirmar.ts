import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query
  await dbConnect()

  const user = await User.findOne({
    emailToken: token,
    emailTokenExpira: { $gt: new Date() },
  })

  if (!user) {
    return res.status(400).json({ message: 'Token inválido ou expirado' })
  }

  user.emailVerificado = true
  user.emailToken = undefined
  user.emailTokenExpira = undefined
  await user.save()

  res.status(200).json({ message: 'E-mail confirmado com sucesso!' })
}
