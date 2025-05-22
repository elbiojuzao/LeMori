import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import Homenagem from '@/models/Homenagem'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  await mongooseConnect()

  try {
    const totalHomenagens = await Homenagem.countDocuments()
    const totalUsuarios = await User.countDocuments()
    const homenagensExpiradas = await Homenagem.countDocuments({ foiNotificadoExpiracao: true })

    res.status(200).json({
      totalHomenagens,
      totalUsuarios,
      homenagensExpiradas
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar estatísticas'
    res.status(500).json({ error: errorMessage })
  }
} 