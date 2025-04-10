import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import { verifyToken } from '@/lib/authMiddleware'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  console.log('REQ.BODY:', req.body)
  if (req.method === 'POST') {
    try {
      const userId = verifyToken(req, res)
      const { nome, nascimento, falecimento, mensagem, musicaLink } = req.body

      const novaHomenagem = new Homenagem({
        nomeHomenageado: nome,
        dataNascimento: nascimento,
        dataFalecimento: falecimento,
        biografia: mensagem,
        musica: musicaLink,
        fotos: [], // implementar upload futuramente
        usuario: userId,
      })

      await novaHomenagem.save()
      return res.status(201).json(novaHomenagem)

    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar homenagem' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
