import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import crypto from 'crypto'
import { sendEmail } from '@/lib/mailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' })
  }

  await mongooseConnect()

  const user = await User.findOne({ email })

  if (!user) {
    return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.' })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const tokenExpira = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  user.emailToken = token
  user.emailTokenExpira = tokenExpira
  await user.save()

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/resetar-senha?token=${token}`

  await sendEmail(
    user.email,
    'Recuperação de Senha - LeMori',
    `<p>Olá ${user.nome},</p>
     <p>Você solicitou a redefinição de sua senha. <a href="${resetUrl}">Clique aqui para redefinir</a>.</p>
     <p>Ou copie e cole este link no navegador: ${resetUrl}</p>
     <p>Se não foi você, apenas ignore este e-mail.</p>`
  )

  return res.status(200).json({ message: 'E-mail de recuperação enviado com sucesso.' })
}