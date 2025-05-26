import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

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
      if (!decoded || !(decoded as any).isAdmin) {
        return res.status(401).json({ error: 'Não autorizado' });
      }
      const { db } = await connectToDatabase();
      const { busca = '', status = 'todos', dataInicio, dataFim } = req.query;
      const pipeline: any[] = [];
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
      const matchStage: any = {};
      if (busca) {
        matchStage.$or = [
          { 'usuario.nome': { $regex: busca, $options: 'i' } },
          { depoimento: { $regex: busca, $options: 'i' } }
        ];
      }
      if (dataInicio || dataFim) {
        matchStage.createdAt = {};
        if (dataInicio) {
          matchStage.createdAt.$gte = new Date(dataInicio as string);
        }
        if (dataFim) {
          matchStage.createdAt.$lte = new Date(dataFim as string);
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
      const depoimentosFormatados = depoimentos.map(depoimento => {
        return {
          ...depoimento,
          _id: depoimento._id.toString(),
          usuario: depoimento.usuario ? {
            ...depoimento.usuario,
            _id: depoimento.usuario._id.toString()
          } : null,
          dataCriacao: depoimento.createdAt ? depoimento.createdAt.toISOString() : ''
        };
      });
      res.status(200).json(depoimentosFormatados);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar depoimentos' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 