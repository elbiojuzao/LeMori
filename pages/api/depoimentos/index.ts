import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      
      const depoimentos = await db.collection('depoimentos')
        .aggregate([
          {
            $match: {
              aprovado: true
            }
          },
          {
            $lookup: {
              from: 'usuarios',
              localField: 'usuario',
              foreignField: '_id',
              as: 'usuario'
            }
          },
          {
            $unwind: '$usuario'
          },
          {
            $project: {
              _id: 1,
              depoimento: 1,
              dataCriacao: 1,
              'usuario._id': 1,
              'usuario.nome': 1,
              'usuario.foto': 1
            }
          },
          {
            $sort: {
              dataCriacao: -1
            }
          }
        ])
        .toArray();

      res.status(200).json(depoimentos);
    } catch (error) {
      console.error('Erro ao buscar depoimentos:', error);
      res.status(500).json({ error: 'Erro ao buscar depoimentos' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 