import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect()

  if (req.method === 'GET') {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET)
      const user = await User.findById(decoded.userId).select('nome cpf rua numero complemento bairro cidade estado email homenagemCreditos')
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }
      return res.status(200).json(user)
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido' })
    }
  } else if (req.method === 'PUT') {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const token = authHeader.split(' ')[1]

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId

      const { nome, rua, numero, complemento, bairro, cidade, estado } = req.body

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { nome, rua, numero, complemento, bairro, cidade, estado },
        { new: true } 
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      return res.status(200).json({ message: 'Dados do perfil atualizados com sucesso', user: updatedUser })
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      return res.status(401).json({ error: 'Token inválido ou erro na atualização' })
    }
  } else {
    return res.status(405).end()
  }
}