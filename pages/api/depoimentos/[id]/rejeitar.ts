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
  if (req.method === 'PUT') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      
      if (!decoded || !decoded.isAdmin) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const { id } = req.query;
      const { db } = await connectToDatabase();

      const result = await db.collection('depoimentos').updateOne(
        { _id: new ObjectId(id as string) },
        { $set: { status: 'rejeitado' } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Depoimento não encontrado' });
      }

      res.status(200).json({ message: 'Depoimento rejeitado com sucesso' });
    } catch (error) {
      console.error('Erro ao rejeitar depoimento:', error);
      res.status(500).json({ error: 'Erro ao rejeitar depoimento' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 