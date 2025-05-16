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

    await mongooseConnect()

    if (req.method === 'GET') {
      const produtos = await Produto.find().sort({ createdAt: -1 })
      return res.status(200).json(produtos)
    }

    if (req.method === 'POST') {
      try {
        const produto = await Produto.create({
          nome: req.body.nome,
          descricao: req.body.descricao,
          valor: req.body.valor
        })
        return res.status(201).json(produto)
      } catch (error: any) {
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map((err: any) => err.message)
          return res.status(400).json({ message: 'Erro de validação', errors })
        }
        throw error
      }
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