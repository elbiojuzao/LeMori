import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import crypto from 'crypto'
import { sendEmail } from '@/lib/mailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email é obrigatório' })

  await mongooseConnect()

  const user = await User.findOne({ email })

  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  if (user.emailVerificado) {
    return res.status(400).json({ error: 'E-mail já verificado' })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

  user.emailToken = token
  user.emailTokenExpira = tokenExpira
  await user.save()

  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verificar-email?token=${token}`

  await sendEmail(
    user.email,
    'Confirmação de Email - LeMori',
    `<p>Olá ${user.nome},</p>
    <p>Para confirmar seu e-mail, <a href="${verificationUrl}">clique aqui</a>.</p>
    <p>Ou copie e cole esse link no navegador: ${verificationUrl}</p>`
  )

  res.status(200).json({ message: 'Novo e-mail de verificação enviado com sucesso' })
}