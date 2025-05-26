import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import ProdutoModel from '@/models/Produto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { db } = await connectToDatabase()
    const produtos = await ProdutoModel.find()
    res.status(200).json(produtos)
  } catch (error: unknown) {
    console.error('Erro ao listar produtos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro ao listar produtos'
    res.status(500).json({ message: errorMessage })
  }
}