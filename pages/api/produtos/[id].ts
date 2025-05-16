import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import ProdutoModel from '@/models/Produto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' })
  }

  await mongooseConnect()

  switch (req.method) {
    case 'GET':
      try {
        const produto = await ProdutoModel.findById(id)
        if (!produto) {
          return res.status(404).json({ error: 'Produto não encontrado' })
        }
        res.status(200).json(produto)
      } catch (error) {
        console.error('Erro ao buscar produto:', error)
        res.status(500).json({ error: 'Erro ao buscar produto' })
      }
      break

    case 'PUT':
      try {
        const { nome, descricao, valor } = req.body
        
        if (!nome && !descricao && !valor) {
          return res.status(400).json({ error: 'Nenhum dado para atualizar' })
        }

        const updateData: { nome?: string; descricao?: string; valor?: number } = {}
        if (nome) updateData.nome = nome
        if (descricao) updateData.descricao = descricao
        if (valor) updateData.valor = Number(valor)

        const produto = await ProdutoModel.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        )

        if (!produto) {
          return res.status(404).json({ error: 'Produto não encontrado' })
        }

        res.status(200).json(produto)
      } catch (error) {
        console.error('Erro ao atualizar produto:', error)
        res.status(500).json({ error: 'Erro ao atualizar produto' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).json({ error: `Método ${req.method} não permitido` })
  }
} 