import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Pedido from '@/models/Pedido';
import User from '@/models/User';
import ItemPedido from '@/models/ItemPedido';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    const { 
      page = '1', 
      limit = '10', 
      status, 
      search,
      startDate,
      endDate,
      sortBy = 'dataCompra',
      sortOrder = 'desc'
    } = req.query;

    const query: Record<string, unknown> = {};

    // Aplicar filtros
    if (status && status !== 'all') {
      query.statusPedido = status;
    }

    if (search) {
      query.$or = [
        { idTransacao: { $regex: search, $options: 'i' } },
        { 'endereco.cep': { $regex: search, $options: 'i' } },
        { 'userId.nome': { $regex: search, $options: 'i' } },
        { 'userId.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      query.dataCompra = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    // Calcular paginação
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Buscar pedidos com paginação
    const pedidos = await Pedido.find(query)
      .sort({ [String(sortBy)]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('userId', 'nome email');

    // Buscar itens dos pedidos
    const pedidosComItens = await Promise.all(
      pedidos.map(async (pedido) => {
        const itens = await ItemPedido.find({ pedidoId: pedido._id });
        return {
          ...pedido.toObject(),
          items: itens
        };
      })
    );

    // Contar total de pedidos para paginação
    const total = await Pedido.countDocuments(query);

    return res.status(200).json({
      pedidos: pedidosComItens,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
        currentPage: parseInt(page as string),
        limit: parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
} 