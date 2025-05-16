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

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID do cupom inválido' })
    }

    await mongooseConnect()

    // PUT - Atualizar cupom
    if (req.method === 'PUT') {
      const { codigo, tipoDesconto, valorDesconto, dataExpiracao, ativo, comissao } = req.body

      // Verifica se já existe outro cupom com o mesmo código
      const cupomExistente = await CupomModel.findOne({ 
        codigo: codigo.toUpperCase(),
        _id: { $ne: id }
      })
      if (cupomExistente) {
        return res.status(400).json({ error: 'Já existe outro cupom com este código' })
      }

      const cupomAtualizado = await CupomModel.findByIdAndUpdate(
        id,
        {
          codigo: codigo.toUpperCase(),
          tipoDesconto,
          valorDesconto,
          dataExpiracao,
          ativo,
          comissao
        },
        { new: true, runValidators: true }
      )

      if (!cupomAtualizado) {
        return res.status(404).json({ error: 'Cupom não encontrado' })
      }

      return res.status(200).json(cupomAtualizado)
    }

    // DELETE - Excluir cupom
    if (req.method === 'DELETE') {
      const cupomDeletado = await CupomModel.findByIdAndDelete(id)

      if (!cupomDeletado) {
        return res.status(404).json({ error: 'Cupom não encontrado' })
      }

      return res.status(200).json({ message: 'Cupom excluído com sucesso' })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error: any) {
    console.error('Erro ao processar requisição de cupom:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.message })
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 