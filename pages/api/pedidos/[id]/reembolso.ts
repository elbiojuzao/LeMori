import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import PedidoModel from '@/models/Pedido'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do pedido inválido' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    await mongooseConnect()

    const pedido = await PedidoModel.findById(id)
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    // Verifica se o pedido pertence ao usuário
    if (pedido.userId.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    // Verifica se o pedido está em um estado que permite reembolso
    if (!['entregue', 'enviado'].includes(pedido.status)) {
      return res.status(400).json({ 
        error: 'Este pedido não pode ser reembolsado no momento' 
      })
    }

    // Verifica se já existe uma solicitação de reembolso
    if (['reembolso_solicitado', 'reembolsado'].includes(pedido.status)) {
      return res.status(400).json({ 
        error: 'Este pedido já possui uma solicitação de reembolso' 
      })
    }

    // Atualiza o status do pedido
    pedido.status = 'reembolso_solicitado'
    await pedido.save()

    // lógica adicional como:
    // - Enviar email para o cliente
    // - Notificar a equipe de suporte
    // - Registrar a solicitação em um sistema de tickets
    // - Iniciar o processo de reembolso no gateway de pagamento

    res.status(200).json({ 
      message: 'Solicitação de reembolso registrada com sucesso',
      pedido 
    })
  } catch (error) {
    console.error('Erro ao processar solicitação de reembolso:', error)
    res.status(500).json({ error: 'Erro ao processar solicitação de reembolso' })
  }
} 