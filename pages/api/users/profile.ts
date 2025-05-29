import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { IncomingForm } from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = await verifyToken(token)
    if (!decoded?.userId) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    await dbConnect()

    // Buscar usuário atual para comparação
    const userAtual = await User.findById(decoded.userId)
    if (!userAtual) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const form = new IncomingForm()
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    // Garantir que os campos sejam strings
    const nome = Array.isArray(fields.nome) ? fields.nome[0] : fields.nome
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email
    const cpf = Array.isArray(fields.cpf) ? fields.cpf[0] : fields.cpf
    const senha = Array.isArray(fields.senha) ? fields.senha[0] : fields.senha
    const dataNascimento = Array.isArray(fields.dataNascimento) ? fields.dataNascimento[0] : fields.dataNascimento
    const foto = files.foto

    const updateData: any = {}

    // Só atualiza se o valor for diferente do atual e não estiver vazio
    if (nome && nome !== userAtual.nome) {
      updateData.nome = nome
    }

    if (email && email !== userAtual.email) {
      updateData.email = email
    }

    if (cpf) {
      // Se o CPF for fornecido e for diferente do atual
      if (cpf !== userAtual.cpf) {
        // Valida o CPF apenas se ele for diferente
        if (typeof cpf === 'string' && !validarCPF(cpf)) {
          return res.status(400).json({ error: 'CPF inválido' })
        }
        updateData.cpf = cpf
      }
    }

    if (dataNascimento && dataNascimento !== userAtual.dataNascimento?.toISOString().split('T')[0]) {
      updateData.dataNascimento = dataNascimento
    }

    if (senha) {
      const bcrypt = require('bcryptjs')
      const salt = await bcrypt.genSalt(10)
      updateData.senha = await bcrypt.hash(senha, salt)
    }

    // Processar upload de foto apenas se uma nova foto foi fornecida
    if (foto && foto.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
      await fs.mkdir(uploadDir, { recursive: true })

      const fileExtension = path.extname(foto.originalFilename)
      const fileName = `${uuidv4()}${fileExtension}`
      const filePath = path.join(uploadDir, fileName)

      await fs.copyFile(foto.filepath, filePath)
      updateData.foto = `/uploads/profiles/${fileName}`
    }

    // Só atualiza se houver campos para atualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json(userAtual)
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { new: true }
    ).select('-senha')

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    res.status(500).json({ error: 'Erro ao atualizar perfil' })
  }
}

function validarCPF(cpf: string): boolean {
  // Remove todos os caracteres não numéricos
  const cpfLimpo = cpf.toString().replace(/[^\d]/g, '')

  if (cpfLimpo.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false

  // Validação do primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i)
  }
  let resto = 11 - (soma % 11)
  let digitoVerificador1 = resto > 9 ? 0 : resto
  if (digitoVerificador1 !== parseInt(cpfLimpo.charAt(9))) return false

  // Validação do segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i)
  }
  resto = 11 - (soma % 11)
  let digitoVerificador2 = resto > 9 ? 0 : resto
  if (digitoVerificador2 !== parseInt(cpfLimpo.charAt(10))) return false

  return true
}