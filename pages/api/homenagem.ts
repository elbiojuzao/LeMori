import { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import Homenagem from '@/models/Homenagem'
import User from '@/models/User'

interface ValidationError {
  errors: {
    [key: string]: {
      message: string;
      path: string;
      value: unknown;
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    await mongooseConnect()

    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    const {
      nome,
      dataNascimento,
      dataFalecimento,
      mensagem,
      imagem,
      musica
    } = req.body

    try {
      const homenagem = await Homenagem.create({
        nome,
        dataNascimento,
        dataFalecimento,
        mensagem,
        imagem,
        musica,
        criadoPor: user._id
      })

      return res.status(201).json(homenagem)
    } catch (error: unknown) {
      if (error instanceof Error && 'errors' in error) {
        const validationError = error as ValidationError
        const errors = Object.values(validationError.errors).map(err => err.message)
        return res.status(400).json({ message: 'Erro de validação', errors })
      }
      throw error
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar homenagem'
    return res.status(500).json({ message: errorMessage })
  }
}
