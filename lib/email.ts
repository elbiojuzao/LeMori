import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

// Validar configurações do SMTP
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingEnvVars.length > 0) {
  console.error('Configuração SMTP incompleta. Variáveis faltando:', missingEnvVars)
  throw new Error('Configuração SMTP incompleta')
}

// Criar transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!to) {
    console.error('Endereço de email não fornecido')
    throw new Error('Endereço de email não fornecido')
  }

  console.log('Tentando enviar email para:', to)

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email enviado com sucesso:', info.messageId)
    return info
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    throw error
  }
} 