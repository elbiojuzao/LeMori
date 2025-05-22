import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'

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

    const decodedToken = await verifyToken(token)
    console.log('Token decodificado:', decodedToken)
    
    if (!decodedToken || !decodedToken.isAdmin) {
      return res.status(403).json({ message: 'Não autorizado - Acesso restrito a administradores' })
    }

    const { db } = await connectToDatabase()
    
    // Lista todas as coleções para debug
    const collections = await db.listCollections().toArray()
    console.log('Coleções disponíveis:', collections.map(c => c.name))
    
    // Busca todas as homenagens com informações do usuário
    const homenagens = await db.collection('homenagem') // Nome correto da coleção em minúsculo e singular
      .aggregate([
        {
          $lookup: {
            from: 'users', // Verifica se o nome da coleção de usuários também está correto
            localField: 'criadoPor',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            nomeHomenageado: 1,
            biografia: 1,
            fotos: { $ifNull: ['$fotos', []] },
            criadoPor: 1,
            userName: { $ifNull: ['$user.nome', 'Usuário removido'] },
            dataNascimento: 1,
            dataFalecimento: 1,
            createdAt: 1,
            ativo: 1,
            slug: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]).toArray()

    console.log('Total de homenagens encontradas:', homenagens.length)
    if (homenagens.length > 0) {
      console.log('Exemplo de homenagem:', JSON.stringify(homenagens[0], null, 2))
    }
    
    return res.status(200).json(homenagens)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao listar homenagens';
    res.status(500).json({ message: errorMessage });
  }
} 