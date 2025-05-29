import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import PedidoModel from '@/models/Pedido'
import ItemPedidoModel from '@/models/ItemPedido'

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
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    // Buscar os itens de cada pedido
    const pedidosComItens = await Promise.all(
      pedidos.map(async (pedido) => {
        const itens = await ItemPedidoModel
          .find({ pedidoId: pedido._id })
          .select('quantidade nomeProduto valorUnitario tipoItem')
          .lean()
          .exec()

        return {
          ...pedido,
          items: itens || []
        }
      })
    )

    res.status(200).json(pedidosComItens)
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar pedidos' })
  }
} 