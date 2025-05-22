import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import User from '@/models/User'
import Homenagem from '@/models/Homenagem'
import Pedido from '@/models/Pedido'
import Produto from '@/models/Produto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    await mongooseConnect()

    // Verifica o token e se é admin
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decodedToken = await verifyToken(token)
    if (!decodedToken || !decodedToken.isAdmin) {
      return res.status(403).json({ error: 'Acesso não autorizado' })
    }

    // Calcula datas para filtros
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const dataInicio7Dias = new Date(hoje)
    dataInicio7Dias.setDate(hoje.getDate() - 7)

    // Busca estatísticas gerais
    const [
      totalUsuarios,
      usuariosAtivos,
      totalHomenagens,
      homenagensAtivas,
      totalProdutos,
      produtosAtivos,
      totalPedidos,
      pedidosRecentes,
      faturamentoTotal,
      faturamentoMes,
      pedidosPendentes
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ statusConta: 'ativo' }),
      Homenagem.countDocuments(),
      Homenagem.countDocuments({ status: 'ativo' }),
      Produto.countDocuments(),
      Produto.countDocuments({ ativo: true }),
      Pedido.countDocuments(),
      Pedido.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'nome email')
        .select('userId dataCompra valorTotal statusPedido statusPagamento createdAt')
        .lean(),
      Pedido.aggregate([
        {
          $match: {
            statusPagamento: 'aprovado'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valorTotal' }
          }
        }
      ]),
      Pedido.aggregate([
        {
          $match: {
            statusPagamento: 'aprovado',
            dataCompra: { $gte: inicioMes }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valorTotal' }
          }
        }
      ]),
      Pedido.countDocuments({
        statusPedido: { $in: ['aguardando', 'processando'] }
      })
    ])

    // Calcula estatísticas dos últimos 7 dias
    const [
      usuariosNovos,
      homenagensNovas,
      pedidosNovos,
      faturamentoRecente
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: dataInicio7Dias } }),
      Homenagem.countDocuments({ createdAt: { $gte: dataInicio7Dias } }),
      Pedido.countDocuments({ dataCompra: { $gte: dataInicio7Dias } }),
      Pedido.aggregate([
        {
          $match: {
            statusPagamento: 'aprovado',
            dataCompra: { $gte: dataInicio7Dias }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valorTotal' }
          }
        }
      ])
    ])

    // Prepara os dados de faturamento
    const faturamentoTotalValor = faturamentoTotal[0]?.total || 0
    const faturamentoMesValor = faturamentoMes[0]?.total || 0
    const faturamentoRecenteValor = faturamentoRecente[0]?.total || 0

    // Formata os pedidos recentes
    const pedidosFormatados = pedidosRecentes.map(pedido => ({
      _id: pedido._id,
      userId: pedido.userId,
      dataCompra: pedido.dataCompra,
      valorTotal: pedido.valorTotal,
      statusPedido: pedido.statusPedido,
      statusPagamento: pedido.statusPagamento,
      createdAt: pedido.createdAt
    }))

    return res.status(200).json({
      usuarios: {
        total: totalUsuarios,
        ativos: usuariosAtivos,
        novos: usuariosNovos,
        crescimento: totalUsuarios > 0 ? (usuariosNovos / totalUsuarios) * 100 : 0
      },
      homenagens: {
        total: totalHomenagens,
        ativas: homenagensAtivas,
        novas: homenagensNovas,
        crescimento: totalHomenagens > 0 ? (homenagensNovas / totalHomenagens) * 100 : 0
      },
      produtos: {
        total: totalProdutos,
        ativos: produtosAtivos
      },
      pedidos: {
        total: totalPedidos,
        novos: pedidosNovos,
        pendentes: pedidosPendentes,
        recentes: pedidosFormatados,
        crescimento: totalPedidos > 0 ? (pedidosNovos / totalPedidos) * 100 : 0
      },
      faturamento: {
        total: faturamentoTotalValor,
        mes: faturamentoMesValor,
        recente: faturamentoRecenteValor,
        crescimento: faturamentoMesValor > 0 ? ((faturamentoRecenteValor / faturamentoMesValor) * 100) : 0
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar estatísticas';
    res.status(500).json({ message: errorMessage });
  }
} 