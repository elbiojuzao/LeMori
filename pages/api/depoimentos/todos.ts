import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

interface DepoimentoMongo {
  _id: string | { toString: () => string };
  depoimento: string;
  status: string;
  createdAt?: Date;
  usuario?: {
    _id: string | { toString: () => string };
    nome: string;
    foto?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      if (!decoded || !(decoded as { isAdmin?: boolean }).isAdmin) {
        return res.status(401).json({ error: 'Não autorizado' });
      }
      const { db } = await connectToDatabase();
      const { busca = '', status = 'todos', dataInicio, dataFim } = req.query;
      const pipeline: Record<string, unknown>[] = [];
      if (status && status !== 'todos') {
        pipeline.push({ $match: { status } });
      }
      pipeline.push(
        {
          $lookup: {
            from: 'users',
            localField: 'usuario',
            foreignField: '_id',
            as: 'usuario'
          }
        },
        {
          $unwind: {
            path: '$usuario',
            preserveNullAndEmptyArrays: true
          }
        }
      );
      const matchStage: Record<string, unknown> = {};
      if (busca) {
        matchStage.$or = [
          { 'usuario.nome': { $regex: busca, $options: 'i' } },
          { depoimento: { $regex: busca, $options: 'i' } }
        ];
      }
      if (dataInicio || dataFim) {
        matchStage.createdAt = {};
        if (dataInicio) {
          (matchStage.createdAt as Record<string, unknown> ).$gte = new Date(dataInicio as string);
        }
        if (dataFim) {
          (matchStage.createdAt as Record<string, unknown> ).$lte = new Date(dataFim as string);
        }
      }
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }
      pipeline.push(
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
        },
        {
          $sort: {
            createdAt: -1
          }
        }
      );
      const depoimentos = await db.collection('depoimentos')
        .aggregate(pipeline)
        .toArray();
      const depoimentosFormatados = depoimentos.map((depoimento) => {
        const d = depoimento as DepoimentoMongo;
        return {
          ...d,
          _id: typeof d._id === 'string' ? d._id : d._id.toString(),
          usuario: d.usuario ? {
            ...d.usuario,
            _id: typeof d.usuario._id === 'string' ? d.usuario._id : d.usuario._id.toString()
          } : null,
          dataCriacao: d.createdAt ? d.createdAt.toISOString() : ''
        };
      });
      res.status(200).json(depoimentosFormatados);
    } catch {
      res.status(500).json({ error: 'Erro ao buscar depoimentos' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 