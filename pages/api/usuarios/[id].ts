import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect()

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' })
  }

  // Verificar autenticação
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const decoded = await verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido' })
  }

  // Verificar se é admin ou o próprio usuário
  const user = await User.findById(decoded.userId)
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' })
  }

  if (!user.isAdmin && decoded.userId !== id) {
    return res.status(403).json({ error: 'Não autorizado' })
  }

  switch (req.method) {
    case 'GET':
      try {
        const usuario = await User.findById(id).select('-senhaHash')
        if (!usuario) {
          return res.status(404).json({ error: 'Usuário não encontrado' })
        }
        res.status(200).json(usuario)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar usuário'
        res.status(500).json({ error: errorMessage })
      }
      break

    case 'PUT':
      try {
        const { nome, email, cpf } = req.body
        const updateData: { nome?: string; email?: string; cpf?: string } = {}

        if (nome) updateData.nome = nome
        if (email) updateData.email = email
        if (cpf) updateData.cpf = cpf

        const usuario = await User.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        ).select('-senhaHash')

        if (!usuario) {
          return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        res.status(200).json(usuario)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário'
        res.status(500).json({ error: errorMessage })
      }
      break

    case 'DELETE':
      try {
        const usuario = await User.findByIdAndDelete(id)
        if (!usuario) {
          return res.status(404).json({ error: 'Usuário não encontrado' })
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso' })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir usuário'
        res.status(500).json({ error: errorMessage })
      }
      break

    default:
      res.status(405).json({ error: 'Método não permitido' })
  }
} 