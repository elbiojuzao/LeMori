import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import crypto from 'crypto'
import { sendEmail } from '@/lib/mailer'

const rateLimitMap = new Map()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nome, email, senha, cpf } = req.body

  if (!nome || !email || !senha || !cpf) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' })
  }

  await mongooseConnect()

  const emailExistente = await User.findOne({ email })
  if (emailExistente) {
    return res.status(400).json({ error: 'E-mail já cadastrado.' })
  }

  const cpfExistente = await User.findOne({ cpf })
  if (cpfExistente) {
    return res.status(400).json({ error: 'CPF já cadastrado.' })
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10)

  const novoUsuario = await User.create({
    nome,
    email,
    senha: senhaCriptografada,
    cpf,
    emailVerificado: false,
  })

  const token = crypto.randomBytes(32).toString('hex')
  const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

  novoUsuario.emailToken = token
  novoUsuario.emailTokenExpira = tokenExpira
  await novoUsuario.save()

  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verificar-email?token=${token}`

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const now = Date.now()
  const lastSent = rateLimitMap.get(ip) || 0

  if (now - lastSent < 60000) {
    return res.status(429).json({ error: 'Espere 1 minuto antes de tentar de novo.' })
  }

  rateLimitMap.set(ip, now)

  await sendEmail(
    novoUsuario.email,
    'Confirmação de Email - LeMori',
    `<p>Olá ${novoUsuario.nome},</p>
     <p>Para confirmar seu e-mail, <a href="${verificationUrl}">clique aqui</a>.</p>
     <p>Ou copie e cole este link no seu navegador: ${verificationUrl}</p>`
  )

  res.status(201).json({ message: 'Usuário registrado com sucesso. Verifique seu e-mail para ativar a conta.' })
}
