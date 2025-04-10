import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import verificarToken from '@/lib/verificarToken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      const userId = verificarToken(req, res)

      const novaHomenagem = new Homenagem({
        ...req.body,
        criador: userId,
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
