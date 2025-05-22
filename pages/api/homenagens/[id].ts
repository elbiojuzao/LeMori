import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Token não fornecido' })

    const decoded = await verifyToken(token)
    if (!decoded) return res.status(401).json({ error: 'Token inválido' })

    const { id } = req.query
    const { db } = await connectToDatabase()

    const homenagem = await db.collection('homenagem').findOne({
      _id: new ObjectId(id as string),
      excluida: { $ne: true }
    })

    if (!homenagem) {
      return res.status(404).json({ error: 'Homenagem não encontrada' })
    }

    if (homenagem.criadoPor.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    if (req.method === 'GET') {
      return res.status(200).json(homenagem)
    }

    if (req.method === 'DELETE') {
      await db.collection('homenagem').updateOne(
        { _id: new ObjectId(id as string) },
        { $set: { excluida: true } }
      )
      return res.status(200).json({ message: 'Homenagem excluída com sucesso' })
    }

    if (req.method === 'PUT') {
      const dadosAtualizados = req.body
      const result = await db.collection('homenagem').updateOne(
        { _id: new ObjectId(id as string) },
        { $set: dadosAtualizados }
      )
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Homenagem não encontrada' })
      }

      const homenagemAtualizada = await db.collection('homenagem').findOne({
        _id: new ObjectId(id as string)
      })

      return res.status(200).json(homenagemAtualizada)
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar homenagem';
    res.status(500).json({ message: errorMessage });
  }
}
