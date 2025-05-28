import type { NextApiRequest, NextApiResponse } from 'next'
import { mp } from '@/lib/mercadopago'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'
import User from '@/models/User'
import ItemPedido from '@/models/ItemPedido'
import { sendEmail } from '@/lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { action, data } = req.body
    console.log('Webhook recebido:', { action, data })

    if (action === 'payment.updated' || action === 'payment.approved') {
      const paymentId = data.id
      const payment = await mp.payment.get({ id: paymentId })
      console.log('Status do pagamento:', payment.status)

      if (payment.status === 'approved' || payment.status === 'pending') {
        const pedidoId = payment.external_reference
        console.log('ID do pedido:', pedidoId)

        await dbConnect()

        const pedido = await Pedido.findById(pedidoId)
        if (!pedido) {
          console.error('Pedido não encontrado:', pedidoId)
          return res.status(404).json({ error: 'Pedido não encontrado' })
        }

        const user = await User.findById(pedido.userId).select('+email')
        if (!user) {
          console.error('Usuário não encontrado:', pedido.userId)
          return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        console.log('Dados do usuário:', {
          userId: user._id,
          nome: user.nome,
          email: user.email
        })

        // Atualizar status do pedido
        pedido.statusPagamento = payment.status === 'approved' ? 'aprovado' : 'pendente'
        await pedido.save()

        // Se o pagamento foi aprovado, processar os itens
        if (payment.status === 'approved') {
          // Buscar itens do pedido
          const itensPedido = await ItemPedido.find({ pedidoId: pedido._id })
          console.log('Itens do pedido:', itensPedido)

          // Processar itens de homenagem
          const itensHomenagem = itensPedido.filter(item => item.tipoItem === 'homenagem')
          if (itensHomenagem.length > 0) {
            // Atualizar créditos do usuário
            user.homenagemCreditos = (user.homenagemCreditos || 0) + itensHomenagem.reduce((total, item) => total + item.quantidade, 0)
            await user.save()
            console.log('Créditos atualizados:', user.homenagemCreditos)
          }

          // Enviar email de confirmação
          try {
            const emailResult = await sendEmail({
              to: user.email,
              subject: 'Pagamento Aprovado - Seu Pedido',
              html: `
                <h1>Pagamento Aprovado!</h1>
                <p>Olá ${user.nome},</p>
                <p>Seu pagamento foi aprovado com sucesso.</p>
                <p>Detalhes do pedido:</p>
                <ul>
                  ${itensPedido.map(item => `
                    <li>${item.nomeProduto} - ${item.quantidade}x - R$ ${item.valorUnitario.toFixed(2)}</li>
                  `).join('')}
                </ul>
                <p>Total: R$ ${pedido.valorTotal.toFixed(2)}</p>
              `
            })
            console.log('Email enviado:', emailResult)
          } catch (emailError) {
            console.error('Erro ao enviar email:', emailError)
          }
        } else if (payment.status === 'pending') {
          // Enviar email de pagamento pendente
          try {
            const emailResult = await sendEmail({
              to: user.email,
              subject: 'Pagamento Pendente - Seu Pedido',
              html: `
                <h1>Pagamento Pendente</h1>
                <p>Olá ${user.nome},</p>
                <p>Seu pagamento está pendente de aprovação.</p>
                <p>Assim que for aprovado, você receberá uma confirmação.</p>
              `
            })
            console.log('Email de pendência enviado:', emailResult)
          } catch (emailError) {
            console.error('Erro ao enviar email de pendência:', emailError)
          }
        }
      } else if (payment.status === 'rejected') {
        const pedidoId = payment.external_reference
        await dbConnect()

        const pedido = await Pedido.findById(pedidoId)
        if (pedido) {
          pedido.statusPagamento = 'rejeitado'
          await pedido.save()

          const user = await User.findById(pedido.userId).select('+email')
          if (user) {
            try {
              const emailResult = await sendEmail({
                to: user.email,
                subject: 'Pagamento Rejeitado - Seu Pedido',
                html: `
                  <h1>Pagamento Rejeitado</h1>
                  <p>Olá ${user.nome},</p>
                  <p>Infelizmente seu pagamento foi rejeitado.</p>
                  <p>Por favor, tente novamente ou entre em contato conosco.</p>
                `
              })
              console.log('Email de rejeição enviado:', emailResult)
            } catch (emailError) {
              console.error('Erro ao enviar email de rejeição:', emailError)
            }
          }
        }
      }
    }

    res.status(200).json({ message: 'Webhook processado com sucesso' })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    res.status(500).json({ error: 'Erro ao processar webhook' })
  }
}