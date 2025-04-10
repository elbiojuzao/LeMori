import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import { verificarToken } from '@/lib/verificarToken'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  if (req.method === 'POST') {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido ou malformado' })
      }

      const token = authHeader.split(' ')[1]
      const { id: usuarioId } = verificarToken(token)

      const novaHomenagem = new Homenagem({
        ...req.body,
        criadoPor: new mongoose.Types.ObjectId(usuarioId),
      })

      await novaHomenagem.save()
      return res.status(201).json(novaHomenagem)
    } catch (error: any) {
      console.error('Erro ao criar homenagem:', error)
      return res.status(500).json({ error: 'Erro ao criar homenagem', detalhes: error.message })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
