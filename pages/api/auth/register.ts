import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import crypto from 'crypto'
import { sendEmail } from '@/lib/mailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const {
    nome, email, senha,
    cpf, rua, numero, complemento,
    bairro, cidade, estado
  } = req.body

  await mongooseConnect()

  const userExistente = await User.findOne({ email })
  if (userExistente) {
    return res.status(400).json({ error: 'Usuário já cadastrado' })
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10)

  // Criar novo usuário (sem confirmação de e-mail ainda)
  const novoUsuario = await User.create({
    nome,
    email,
    senha: senhaCriptografada,
    cpf,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    emailVerificado: false,
  })

  // Gerar token de verificação
  const token = crypto.randomBytes(32).toString('hex')
  const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

  novoUsuario.emailToken = token
  novoUsuario.emailTokenExpira = tokenExpira
  await novoUsuario.save()

  // Montar URL de verificação
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verificar-email?token=${token}`

  // Enviar o e-mail
  await sendEmail(
    novoUsuario.email,
    'Confirmação de Email - LeMori',
    `<p>Olá ${novoUsuario.nome},</p>
     <p>Para confirmar seu e-mail, <a href="${verificationUrl}">clique aqui</a>.</p>
     <p>Ou copie e cole este link no seu navegador: ${verificationUrl}</p>`
  )

  res.status(201).json({ message: 'Usuário registrado com sucesso. Verifique seu e-mail para ativar a conta.' })
}