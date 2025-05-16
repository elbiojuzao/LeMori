import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import PedidoModel from '@/models/Pedido'

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

    await mongooseConnect()

    const pedidos = await PedidoModel
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 }) // Ordena do mais recente para o mais antigo
      .populate('items.product', 'name price') // Popula os dados do produto
      .exec()

    res.status(200).json(pedidos)
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar pedidos' })
  }
} 