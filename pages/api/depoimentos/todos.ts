import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  isAdmin: boolean;
}

interface Usuario {
  _id: ObjectId;
  nome: string;
  foto?: string;
}

interface Depoimento {
  _id: ObjectId;
  depoimento: string;
  aprovado: boolean;
  dataCriacao: Date;
  usuario: ObjectId | string;
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

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      
      if (!decoded || !decoded.isAdmin) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const { db } = await connectToDatabase();
      
      // Pegar os parâmetros de filtro da query
      const { 
        busca = '', 
        status = 'todos',
        dataInicio,
        dataFim 
      } = req.query;

      // Construir o pipeline de agregação
      const pipeline: any[] = [];
      // Filtro de status
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

      // Adicionar filtros ao pipeline
      const matchStage: any = {};

      // Filtro de busca (usuário ou depoimento)
      if (busca) {
        matchStage.$or = [
          { 'usuario.nome': { $regex: busca, $options: 'i' } },
          { depoimento: { $regex: busca, $options: 'i' } }
        ];
      }

      // Filtro de data
      if (dataInicio || dataFim) {
        matchStage.createdAt = {};
        if (dataInicio) {
          matchStage.createdAt.$gte = new Date(dataInicio as string);
        }
        if (dataFim) {
          matchStage.createdAt.$lte = new Date(dataFim as string);
        }
      }

      // Adicionar o estágio de match se houver filtros
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Adicionar projeção e ordenação
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

      // Primeiro, vamos verificar se existem depoimentos na coleção
      const totalDepoimentos = await db.collection('depoimentos').findOne();

      // Vamos verificar se o usuário existe
      if (totalDepoimentos) {
        const usuarioExemplo = await db.collection('usuarios').findOne({ 
          _id: new ObjectId(totalDepoimentos.usuario) 
        });
      }

      const depoimentos = await db.collection('depoimentos')
        .aggregate(pipeline)
        .toArray();

      // Converter ObjectId para string e Date para string ISO
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