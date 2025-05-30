import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Pedido from '@/models/Pedido';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = await verifyToken(token);
    if (!decoded?.userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar se o usuário é admin
    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { id } = req.query;
    const { status } = req.body;

    if (!status || !['pendente', 'processando', 'enviado', 'entregue'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      id,
      { statusPedido: status },
      { new: true }
    );

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    return res.status(200).json(pedido);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
} 