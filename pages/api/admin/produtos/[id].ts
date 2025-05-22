import { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'
import Produto from '@/models/Produto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verifica o token e se é admin
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    const decodedToken = await verifyToken(token)
    if (!decodedToken || !decodedToken.isAdmin) {
      return res.status(403).json({ message: 'Acesso restrito a administradores' })
    }

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID do produto não fornecido' })
    }

    await mongooseConnect()
    
    const produto = await Produto.findById(id)
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' })
    }

    if (req.method === 'PUT') {
      try {
        // Se estiver atualizando apenas o destaque
        if (req.body.destaque !== undefined && Object.keys(req.body).length === 1) {
          const novoValor = Boolean(req.body.destaque);
          
          const produtoAtualizado = await Produto.findByIdAndUpdate(
            id,
            { destaque: novoValor },
            { new: true }
          );

          if (!produtoAtualizado) {
            return res.status(404).json({ message: 'Produto não encontrado' });
          }

          return res.status(200).json(produtoAtualizado);
        }

        // Para outras atualizações
        const updateData = {
          ...(req.body.nome !== undefined && { nome: req.body.nome }),
          ...(req.body.descricao !== undefined && { descricao: req.body.descricao }),
          ...(req.body.valor !== undefined && { valor: req.body.valor }),
          ...(req.body.destaque !== undefined && { destaque: req.body.destaque })
        };

        const produtoAtualizado = await Produto.findByIdAndUpdate(
          id,
          { $set: updateData },
          { 
            new: true,
            runValidators: true
          }
        );
        
        if (!produtoAtualizado) {
          return res.status(400).json({ message: 'Não foi possível atualizar o produto' });
        }

        return res.status(200).json(produtoAtualizado);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar produto';
        res.status(500).json({ message: errorMessage });
      }
    }

    if (req.method === 'DELETE') {
      await Produto.findByIdAndDelete(id)
      return res.status(200).json({ message: 'Produto excluído com sucesso' })
    }

    return res.status(405).json({ message: 'Método não permitido' })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    res.status(500).json({ 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
} 