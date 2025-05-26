import { NextApiRequest, NextApiResponse } from 'next';
import { Depoimento } from '@/models/Depoimento';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req });

    // Verifica se o usuário está autenticado e é admin
    if (!session || !session.user.isAdmin) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    if (req.method !== 'PUT') {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { id } = req.query;
    const { aprovado } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID do depoimento é obrigatório' });
    }

    try {
      const depoimento = await Depoimento.findByIdAndUpdate(
        id,
        { aprovado },
        { new: true }
      ).populate('usuario', 'nome foto');

      if (!depoimento) {
        return res.status(404).json({ error: 'Depoimento não encontrado' });
      }

      res.status(200).json(depoimento);
    } catch (error) {
      console.error('Erro ao atualizar depoimento:', error);
      res.status(500).json({ error: 'Erro ao atualizar depoimento' });
    }
  } catch (error) {
    console.error('Erro de conexão com o banco de dados:', error);
    res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
  }
} 