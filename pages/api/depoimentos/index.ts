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
      
      const limit = Number(req.query.limit) || 3;
      const depoimentos = await db.collection('depoimentos')
        .aggregate([
          { $match: { status: 'aprovado' } },
          { $sample: { size: limit } },
          {
            $lookup: {
              from: 'users',
              localField: 'usuario',
              foreignField: '_id',
              as: 'usuario'
            }
          },
          { $unwind: '$usuario' },
          {
            $project: {
              _id: 1,
              depoimento: 1,
              status: 1,
              createdAt: 1,
              'usuario._id': 1,
              'usuario.nome': 1,
              'usuario.foto': 1
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