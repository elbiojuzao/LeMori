import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Verifica o token e se é admin
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    let decodedToken
    try {
      decodedToken = await verifyToken(token)
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido ou expirado' })
    }

    if (!decodedToken) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    const { db } = await connectToDatabase()
    
    // Busca todas as homenagens com informações do usuário
    const homenagens = await db.collection('homenagens')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true // Mantém homenagens mesmo se o usuário não existir mais
          }
        },
        {
          $project: {
            _id: 1,
            nome: 1,
            historia: 1,
            fotos: 1,
            userId: 1,
            userName: { $ifNull: ['$user.name', 'Usuário removido'] },
            dataNascimento: 1,
            dataFalecimento: 1,
            createdAt: 1,
            ativo: 1,
            slug: 1
          }
        },
        {
          $sort: { createdAt: -1 } // Ordena por data de criação, mais recentes primeiro
        }
      ]).toArray()

    return res.status(200).json(homenagens)
  } catch (error: any) {
    console.error('Erro ao listar homenagens:', error)
    return res.status(500).json({ 
      message: 'Erro ao carregar homenagens',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
} 