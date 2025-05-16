import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Verifica o token e se é admin
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    const decodedToken = await verifyToken(token)
    console.log('Token decodificado:', decodedToken)

    if (!decodedToken || !decodedToken.isAdmin) {
      return res.status(403).json({ message: 'Não autorizado' })
    }

    const { id } = req.query
    const { ativo } = req.body

    if (typeof ativo !== 'boolean') {
      return res.status(400).json({ message: 'Status inválido' })
    }

    const { db } = await connectToDatabase()
    
    console.log(`Atualizando homenagem ${id} para status ativo=${ativo}`)
    
    const result = await db.collection('homenagem').updateOne(
      { _id: new ObjectId(id as string) },
      { $set: { ativo } }
    )

    console.log('Resultado da atualização:', result)

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Homenagem não encontrada' })
    }

    return res.status(200).json({ message: 'Status atualizado com sucesso' })
  } catch (error: any) {
    console.error('Erro ao atualizar status da homenagem:', error)
    return res.status(500).json({ message: 'Erro ao atualizar status da homenagem' })
  }
} 