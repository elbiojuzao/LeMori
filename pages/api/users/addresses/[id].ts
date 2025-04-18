import type { NextApiRequest, NextApiResponse } from 'next';
import mongooseConnect from '@/lib/mongoose';
import Address from '@/models/Address';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

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
    const addressId = req.query.id;

    if (req.method === 'PUT') {
      const { cep, rua, numero, complemento, bairro, cidade, estado } = req.body;
      try {
        const updatedAddress = await Address.findOneAndUpdate(
          { _id: addressId, userId }, // Garante que o endereço pertence ao usuário
          { cep, rua, numero, complemento, bairro, cidade, estado },
          { new: true }
        );

        if (!updatedAddress) {
          return res.status(404).json({ error: 'Endereço não encontrado ou não pertence ao usuário' });
        }

        return res.status(200).json({ message: 'Endereço atualizado com sucesso', address: updatedAddress });
      } catch (error) {
        console.error('Erro ao atualizar endereço:', error);
        return res.status(500).json({ error: 'Erro ao atualizar endereço' });
      }
    } else if (req.method === 'DELETE') {
      try {
        const deletedAddress = await Address.findOneAndDelete({ _id: addressId, userId });

        if (!deletedAddress) {
          return res.status(404).json({ error: 'Endereço não encontrado ou não pertence ao usuário' });
        }

        return res.status(200).json({ message: 'Endereço removido com sucesso', address: deletedAddress });
      } catch (error) {
        console.error('Erro ao remover endereço:', error);
        return res.status(500).json({ error: 'Erro ao remover endereço' });
      }
    } else {
      return res.status(405).end();
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}