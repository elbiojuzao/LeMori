import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import { verifyToken  } from '@/lib/verificarToken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Token não fornecido' })

    const { userId: usuarioIdToken } = verifyToken(token)

    const idParametro = req.query.id?.toString()

    // Verifica se o usuário do token bate com o id do parâmetro
    if (usuarioIdToken !== idParametro) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const homenagens = await Homenagem.find({ criadoPor: usuarioIdToken, excluida: false, }).sort({ createdAt: -1 })
    return res.status(200).json(homenagens)
  } catch (error: any) {
    console.error('Erro ao buscar homenagens:', error)
    return res.status(500).json({ error: 'Erro ao buscar homenagens', detalhes: error.message })
  }
}
