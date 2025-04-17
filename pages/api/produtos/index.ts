import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import ProdutoModel from '@/models/Produto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    await mongooseConnect()
    const produtos = await ProdutoModel.find()
    res.status(200).json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    res.status(500).json({ error: 'Erro ao buscar produtos' })
  }
}