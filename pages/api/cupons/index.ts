import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import CupomModel from '@/models/Cupom'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Acesso restrito a administradores' })
    }

    await mongooseConnect()

    // GET - Listar cupons
    if (req.method === 'GET') {
      const cupons = await CupomModel.find()
        .sort({ createdAt: -1 })

      return res.status(200).json(cupons)
    }

    // POST - Criar novo cupom
    if (req.method === 'POST') {
      const { codigo, tipoDesconto, valorDesconto, dataExpiracao, ativo, comissao } = req.body

      // Verifica se já existe um cupom com o mesmo código
      const cupomExistente = await CupomModel.findOne({ codigo: codigo.toUpperCase() })
      if (cupomExistente) {
        return res.status(400).json({ error: 'Já existe um cupom com este código' })
      }

      const cupom = await CupomModel.create({
        codigo: codigo.toUpperCase(),
        tipoDesconto,
        valorDesconto,
        dataExpiracao,
        ativo,
        comissao
      })

      return res.status(201).json(cupom)
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error: any) {
    console.error('Erro ao processar requisição de cupons:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.message })
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 