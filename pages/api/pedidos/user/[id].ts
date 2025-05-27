import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import PedidoModel from '@/models/Pedido'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // Verifica se é admin
    const user = await User.findById(decoded.userId)
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Acesso não autorizado' })
    }

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID do usuário inválido' })
    }

    await mongooseConnect()

    const pedidos = await PedidoModel
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name price')
      .exec()

    res.status(200).json(pedidos)
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar pedidos' })
  }
} 