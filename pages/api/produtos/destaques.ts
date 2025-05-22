import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import ProdutoModel from '@/models/Produto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    await mongooseConnect()

    const produtos = await ProdutoModel.find({ destaque: true })
      .limit(3)
      .select('nome descricao valor imagens')
      .sort({ createdAt: -1 })

    // Mapeia os produtos para o formato esperado pelo frontend
    const produtosFormatados = produtos.map(produto => ({
      _id: produto._id,
      nome: produto.nome,
      descricao: produto.descricao,
      valor: Number(produto.valor) || 0,
      imagens: produto.imagens,
      imagemUrl: produto.imagemUrl
    }))

    res.status(200).json(produtosFormatados)
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error)
    res.status(500).json({ error: 'Erro ao buscar produtos em destaque' })
  }
} 