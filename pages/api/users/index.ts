import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    await mongooseConnect()

    // Verifica o token e se é admin
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decodedToken = await verifyToken(token)
    if (!decodedToken || !decodedToken.isAdmin) {
      return res.status(403).json({ error: 'Acesso não autorizado' })
    }

    const {
      nome,
      dataCriacaoInicio,
      dataCriacaoFim,
      dataNascimentoInicio,
      dataNascimentoFim,
      minHomenagens
    } = req.query

    const filtros: Record<string, unknown> = {}

    if (nome) {
      filtros.$or = [
        { nome: { $regex: nome, $options: 'i' } },
        { email: { $regex: nome, $options: 'i' } },
        { cpf: { $regex: nome, $options: 'i' } }
      ]
    }

    if (dataCriacaoInicio || dataCriacaoFim) {
      filtros.createdAt = {}
      
      // Se tem data inicial, inclui registros com data >= inicial OU registros sem data
      if (dataCriacaoInicio) {
        const dataInicio = new Date(dataCriacaoInicio as string)
        if (!isNaN(dataInicio.getTime())) {
          filtros.$or = [
            { createdAt: { $gte: dataInicio } },
            { createdAt: null }
          ]
        }
      }
      
      // Se tem data final, inclui registros com data <= final OU registros sem data
      if (dataCriacaoFim) {
        const fim = new Date(dataCriacaoFim as string)
        if (!isNaN(fim.getTime())) {
          fim.setHours(23, 59, 59, 999)
          filtros.$or = filtros.$or || []
          filtros.$or.push(
            { createdAt: { $lte: fim } },
            { createdAt: null }
          )
        }
      }
    }

    if (dataNascimentoInicio || dataNascimentoFim) {
      filtros.dataNascimento = {}
      
      // Se tem data inicial, inclui registros com data >= inicial OU registros sem data
      if (dataNascimentoInicio) {
        const dataInicio = new Date(dataNascimentoInicio as string)
        if (!isNaN(dataInicio.getTime())) {
          filtros.$or = filtros.$or || []
          filtros.$or.push(
            { dataNascimento: { $gte: dataInicio } },
            { dataNascimento: null }
          )
        }
      }
      
      // Se tem data final, inclui registros com data <= final OU registros sem data
      if (dataNascimentoFim) {
        const fim = new Date(dataNascimentoFim as string)
        if (!isNaN(fim.getTime())) {
          fim.setHours(23, 59, 59, 999)
          filtros.$or = filtros.$or || []
          filtros.$or.push(
            { dataNascimento: { $lte: fim } },
            { dataNascimento: null }
          )
        }
      }
    }

    const usuarios = await User.find(filtros)
      .select('nome email cpf dataNascimento createdAt quantidadeHomenagens statusConta isAdmin')
      .sort({ createdAt: -1, _id: -1 }) // Adiciona _id como critério secundário de ordenação
      .lean()

    if (minHomenagens) {
      const minHomenagensNum = parseInt(minHomenagens as string)
      return res.status(200).json(
        usuarios.filter(u => u.quantidadeHomenagens >= minHomenagensNum)
      )
    }

    return res.status(200).json(usuarios)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar usuários';
    console.error('Erro ao buscar usuários:', errorMessage)
    return res.status(500).json({ 
      error: 'Erro ao buscar usuários',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    })
  }
}