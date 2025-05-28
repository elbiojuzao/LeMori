import type { NextApiRequest, NextApiResponse } from 'next'
import ProdutoModel from '@/models/Produto'
import mongooseConnect from '@/lib/mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Estabelece conexão com o MongoDB
    await mongooseConnect()

    // Busca produtos ativos
    const produtos = await ProdutoModel.find({ ativo: true })
      .select('nome descricao preco precoPromocional promocaoAtiva inicioPromocao fimPromocao imagens destaque estoque categoria isFisico largura altura comprimento peso')
      .sort({ createdAt: -1 })
      .lean()

    res.status(200).json(produtos)
  } catch (error: unknown) {
    console.error('Erro ao listar produtos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro ao listar produtos'
    res.status(500).json({ 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    })
  }
}