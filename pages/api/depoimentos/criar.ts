import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  isAdmin: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      
      if (!decoded) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const { db } = await connectToDatabase();
      
      const depoimento = {
        depoimento: req.body.depoimento,
        usuario: new ObjectId(decoded.id),
        status: 'pendente',
        createdAt: new Date()
      };

      const result = await db.collection('depoimentos').insertOne(depoimento);

      const depoimentoCriado = await db.collection('depoimentos')
        .aggregate([
          {
            $match: {
              _id: result.insertedId
            }
          },
          {
            $lookup: {
              from: 'users',
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
          }
        ])
        .toArray();

      res.status(201).json(depoimentoCriado[0]);
    } catch (error) {
      console.error('Erro ao criar depoimento:', error);
      res.status(500).json({ error: 'Erro ao criar depoimento' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 