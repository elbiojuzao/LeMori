import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Token não fornecido' })

    const decoded = await verifyToken(token)
    if (!decoded) return res.status(401).json({ error: 'Token inválido' })

    const idParametro = req.query.id?.toString()

    // Verifica se o usuário do token bate com o id do parâmetro
    if (decoded.userId !== idParametro) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const { db } = await connectToDatabase()
    
    console.log('Buscando homenagens para o usuário:', idParametro)
    
    const homenagens = await db.collection('homenagem')
      .find({ 
        criadoPor: new ObjectId(idParametro),
        excluida: { $ne: true }
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log('Homenagens encontradas:', homenagens.length)

    return res.status(200).json(homenagens)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar homenagens';
    console.error('Erro ao buscar homenagens:', errorMessage);
    return res.status(500).json({ error: 'Erro ao buscar homenagens', detalhes: errorMessage });
  }
}
