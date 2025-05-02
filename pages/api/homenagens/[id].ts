import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import { verifyToken } from '@/lib/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  const { id } = req.query

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token não fornecido' })

  const decoded = verifyToken(token)
  if (!decoded) return res.status(401).json({ error: 'Token inválido' })

  const userId = decoded.userId

  try {
    const homenagem = await Homenagem.findById(id)
    if (!homenagem) return res.status(404).json({ error: 'Homenagem não encontrada' })

    if (!homenagem.criadoPor || homenagem.criadoPor.toString() !== userId) return res.status(403).json({ error: 'Acesso negado' })

    if (req.method === 'GET') return res.status(200).json(homenagem)

    if (req.method === 'DELETE') {
      homenagem.excluida = true
      await homenagem.save()
      return res.status(200).json({ message: 'Homenagem excluída com sucesso' })
    }

    if (req.method === 'PUT') {
      const dadosAtualizados = req.body
      Object.assign(homenagem, dadosAtualizados)
      await homenagem.save()
      return res.status(200).json(homenagem)
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
