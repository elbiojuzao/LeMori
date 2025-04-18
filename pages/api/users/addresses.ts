import type { NextApiRequest, NextApiResponse } from 'next';
import mongooseConnect from '@/lib/mongoose';
import Address from '@/models/Address';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const MAX_ADDRESSES_PER_USER = 3;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    if (req.method === 'GET') {
      try {
        const addresses = await Address.find({ userId });
        return res.status(200).json({ addresses });
      } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        return res.status(500).json({ error: 'Erro ao buscar endereços' });
      }
    } else if (req.method === 'POST') {
      const { cep, rua, numero, complemento, bairro, cidade, estado } = req.body;
      try {
        // 1. Consultar o número de endereços do usuário
        const addressCount = await Address.countDocuments({ userId });

        // 2. Verificar se o limite foi atingido
        if (addressCount >= MAX_ADDRESSES_PER_USER) {
          return res.status(400).json({ error: `Você atingiu o limite de ${MAX_ADDRESSES_PER_USER} endereços cadastrados.` });
        }

        // 3. Criar o novo endereço se o limite não foi atingido
        const newAddress = await Address.create({
          cep,
          rua,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          userId,
        });
        return res.status(201).json({ message: 'Endereço salvo com sucesso', address: newAddress });
      } catch (error) {
        console.error('Erro ao salvar endereço:', error);
        return res.status(500).json({ error: 'Erro ao salvar endereço' });
      }
    } else {
      return res.status(405).end();
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}