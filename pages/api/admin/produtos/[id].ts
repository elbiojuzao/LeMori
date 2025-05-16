import { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import Produto from '@/models/Produto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verifica o token e se é admin
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    const decodedToken = await verifyToken(token)
    if (!decodedToken || !decodedToken.isAdmin) {
      return res.status(403).json({ message: 'Acesso restrito a administradores' })
    }

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID do produto não fornecido' })
    }

    await mongooseConnect()
    
    const produto = await Produto.findById(id)
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' })
    }

    if (req.method === 'PUT') {
      try {
        const produtoAtualizado = await Produto.findByIdAndUpdate(
          id,
          {
            nome: req.body.nome,
            descricao: req.body.descricao,
            valor: req.body.valor
          },
          { 
            new: true,
            runValidators: true
          }
        )
        return res.status(200).json(produtoAtualizado)
      } catch (error: any) {
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map((err: any) => err.message)
          return res.status(400).json({ message: 'Erro de validação', errors })
        }
        throw error
      }
    }

    if (req.method === 'DELETE') {
      await Produto.findByIdAndDelete(id)
      return res.status(200).json({ message: 'Produto excluído com sucesso' })
    }

    return res.status(405).json({ message: 'Método não permitido' })
  } catch (error: any) {
    console.error('Erro na API de produtos:', error)
    return res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
} 