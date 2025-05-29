import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import UserModel from '@/models/User'
import { isValidCPF } from '@/lib/cpf'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface DecodedToken {
  userId: string
  email: string
}

interface UserData {
  nome?: string
  cpf?: string
  email?: string
  senha?: string
  dataNascimento?: string
  foto?: string
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

    const decoded = await verifyToken(token) as DecodedToken
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    await mongooseConnect()

    // Buscar usuário atual para comparação
    const userAtual = await UserModel.findById(decoded.userId)
    if (!userAtual) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const form = new formidable.IncomingForm()
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    const updateData: UserData = {}

    // Processar campos do formulário
    if (fields.nome && fields.nome[0] !== userAtual.nome) {
      updateData.nome = fields.nome[0]
    }

    if (fields.email && fields.email[0] !== userAtual.email) {
      updateData.email = fields.email[0]
    }

    if (fields.cpf && fields.cpf[0] !== userAtual.cpf) {
      if (!isValidCPF(fields.cpf[0])) {
        return res.status(400).json({ error: 'CPF inválido' })
      }
      updateData.cpf = fields.cpf[0]
    }

    if (fields.dataNascimento && fields.dataNascimento[0] !== userAtual.dataNascimento?.toISOString().split('T')[0]) {
      updateData.dataNascimento = fields.dataNascimento[0]
    }

    if (fields.senha && fields.senha[0]) {
      const bcrypt = require('bcryptjs')
      const salt = await bcrypt.genSalt(10)
      updateData.senha = await bcrypt.hash(fields.senha[0], salt)
    }

    // Processar upload de foto
    if (files.foto && files.foto[0].size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
      await fs.mkdir(uploadDir, { recursive: true })

      const fileExtension = path.extname(files.foto[0].originalFilename || '')
      const fileName = `${uuidv4()}${fileExtension}`
      const filePath = path.join(uploadDir, fileName)

      await fs.copyFile(files.foto[0].filepath, filePath)
      updateData.foto = `/uploads/profiles/${fileName}`
    }

    // Só atualiza se houver campos para atualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json(userAtual)
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true }
    ).select('-senha')

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    res.status(500).json({ error: 'Erro ao atualizar perfil' })
  }
}