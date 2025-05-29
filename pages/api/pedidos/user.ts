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
      .populate({
        path: 'items',
        select: 'quantidade nomeProduto valorUnitario produtoId',
        populate: {
          path: 'produtoId',
          select: 'nome preco'
        },
        options: { strictPopulate: false }
      })
      .lean()
      .exec()

    // Garante que items seja sempre um array, mesmo que vazio
    const pedidosFormatados = pedidos.map(pedido => ({
      ...pedido,
      items: pedido.items || []
    }))

    res.status(200).json(pedidosFormatados)
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar pedidos' })
  }
} 