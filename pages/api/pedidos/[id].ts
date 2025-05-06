import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  if (req.method === 'GET') {
    try {
      await dbConnect()

      const pedido = await Pedido.findById(id)
        .populate('user', 'nome email cpf telefone')
        .populate('itens') 

      if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado' })
      }

      return res.status(200).json(pedido)
    } catch (error) {
      console.error('Erro ao buscar pedido:', error)
      return res.status(500).json({ message: 'Erro ao buscar pedido' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler