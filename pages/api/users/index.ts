import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect()

  if (req.method === 'GET') {
    const {
      nome,
      dataCriacaoInicio,
      dataCriacaoFim,
      dataNascimentoInicio,
      dataNascimentoFim,
      minHomenagens
    } = req.query

    const filtros: any = {}

    if (nome) {
      filtros.nome = { $regex: nome, $options: 'i' }
    }

    if (dataCriacaoInicio || dataCriacaoFim) {
      filtros.createdAt = {}
      if (dataCriacaoInicio) filtros.createdAt.$gte = new Date(dataCriacaoInicio as string)
      if (dataCriacaoFim) filtros.createdAt.$lte = new Date(dataCriacaoFim as string)
    }

    if (dataNascimentoInicio || dataNascimentoFim) {
      filtros.dataNascimento = {}
      if (dataNascimentoInicio) filtros.dataNascimento.$gte = new Date(dataNascimentoInicio as string)
      if (dataNascimentoFim) filtros.dataNascimento.$lte = new Date(dataNascimentoFim as string)
    }

    try {
      const usuarios = await User.find(filtros)
        .select('nome email cpf dataNascimento createdAt homenagens')
        .lean()

      const usuariosComContagem = usuarios.map(user => ({
        ...user,
        quantidadeHomenagens: user.homenagens?.length || 0
      }))

      if (minHomenagens) {
        return res.status(200).json(
          usuariosComContagem.filter(u => u.quantidadeHomenagens >= parseInt(minHomenagens as string))
        )
      }

      return res.status(200).json(usuariosComContagem)
    } catch (err) {
      console.error('Erro ao buscar usuários:', err)
      return res.status(500).json({ error: 'Erro ao buscar usuários' })
    }
  }

  return res.status(405).end()
}