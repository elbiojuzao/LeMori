import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'
import { isValidObjectId } from 'mongoose'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      await dbConnect()

      const { search, statusPagamento, tipoProduto, dataInicio, dataFim, ordenacao } = req.query
      const filtros: Record<string, unknown> = {}
      const sort: Record<string, 1 | -1> = {}

      if (search) {
        filtros['$or'] = [
          { _id: isValidObjectId(search as string) ? search : null },
          { 'user.nome': { $regex: search, $options: 'i' } },
        ]
      }

      if (statusPagamento) {
        filtros.statusPagamento = statusPagamento
      }

      if (tipoProduto === 'sim') {
        filtros.itensFisico = true
      } else if (tipoProduto === 'nao') {
        filtros.itensFisico = false
      }

      if (dataInicio && dataFim) {
        filtros.createdAt = { $gte: new Date(dataInicio as string), $lte: new Date(dataFim as string) }
      } else if (dataInicio) {
        filtros.createdAt = { $gte: new Date(dataInicio as string) }
      } else if (dataFim) {
        filtros.createdAt = { $lte: new Date(dataFim as string) }
      }

      if (ordenacao === 'asc') {
        sort.createdAt = 1
      } else if (ordenacao === 'desc') {
        sort.createdAt = -1
      }

      const pedidos = await Pedido.find(filtros)
        .sort(sort)
        .populate('user', 'nome email cpf telefone')

      res.status(200).json(pedidos)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao listar pedidos';
      res.status(500).json({ message: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler