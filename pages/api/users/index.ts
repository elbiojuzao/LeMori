import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'
import Homenagem from '@/models/Homenagem'
import mongoose from 'mongoose'

interface FiltrosUsuario {
  nome?: string;
  dataCriacaoInicio?: string;
  dataCriacaoFim?: string;
  dataNascimentoInicio?: string;
  dataNascimentoFim?: string;
  minHomenagens?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Conecta ao banco de dados primeiro
    await mongooseConnect()

    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    // Verifica se é admin
    const user = await User.findById(decoded.userId)
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Acesso não autorizado' })
    }

    // Prepara os filtros
    const filtros: FiltrosUsuario = req.query
    const query: Record<string, unknown> = {}

    if (filtros.nome) {
      query.$or = [
        { nome: { $regex: filtros.nome, $options: 'i' } },
        { email: { $regex: filtros.nome, $options: 'i' } },
        { cpf: { $regex: filtros.nome, $options: 'i' } }
      ]
    }

    if (filtros.dataCriacaoInicio || filtros.dataCriacaoFim) {
      query.createdAt = query.createdAt || {};
      if (filtros.dataCriacaoInicio) {
        (query.createdAt as Record<string, unknown>).$gte = new Date(filtros.dataCriacaoInicio);
      }
      if (filtros.dataCriacaoFim) {
        (query.createdAt as Record<string, unknown>).$lte = new Date(filtros.dataCriacaoFim);
      }
    }

    if (filtros.dataNascimentoInicio || filtros.dataNascimentoFim) {
      query.dataNascimento = query.dataNascimento || {};
      if (filtros.dataNascimentoInicio) {
        (query.dataNascimento as Record<string, unknown>).$gte = new Date(filtros.dataNascimentoInicio);
      }
      if (filtros.dataNascimentoFim) {
        (query.dataNascimento as Record<string, unknown>).$lte = new Date(filtros.dataNascimentoFim);
      }
    }

    // Busca todos os usuários com os filtros
    const usuarios = await User.find(query, '-senha').lean()

    // Para cada usuário, busca a contagem de homenagens
    const usuariosComHomenagens = await Promise.all(
      usuarios.map(async (usuario) => {
        const usuarioId = new mongoose.Types.ObjectId(String(usuario._id))
        await Homenagem.find({
          criadoPor: usuarioId
        }).lean()
        // Conta homenagens ativas ou sem o campo ativo
        const quantidadeHomenagens = await Homenagem.countDocuments({
          criadoPor: usuarioId,
          $or: [
            { ativo: true },
            { ativo: { $exists: false } }
          ],
          excluida: { $ne: true }
        })
        return {
          ...usuario,
          quantidadeHomenagens
        }
      })
    )

    // Aplica filtro de mínimo de homenagens se especificado
    const usuariosFiltrados = filtros.minHomenagens
      ? usuariosComHomenagens.filter(u => u.quantidadeHomenagens >= parseInt(filtros.minHomenagens!))
      : usuariosComHomenagens

    res.status(200).json(usuariosFiltrados)
  } catch {
    res.status(500).json({ message: 'Erro ao listar usuários' })
  }
}