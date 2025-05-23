import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect()

  // Verificar autenticação
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const decoded = await verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido' })
  }

  // Verificar se é admin
  const user = await User.findById(decoded.userId)
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Não autorizado' })
  }

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', search = '' } = req.query
      const pageNumber = parseInt(page as string)
      const limitNumber = parseInt(limit as string)
      const skip = (pageNumber - 1) * limitNumber

      const query = search
        ? {
            $or: [
              { nome: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { cpf: { $regex: search, $options: 'i' } },
            ],
          }
        : {}

      const [usuarios, total] = await Promise.all([
        User.find(query)
          .select('-senhaHash')
          .skip(skip)
          .limit(limitNumber)
          .sort({ createdAt: -1 }),
        User.countDocuments(query),
      ])

      res.status(200).json({
        usuarios,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar usuários'
      res.status(500).json({ error: errorMessage })
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
} 