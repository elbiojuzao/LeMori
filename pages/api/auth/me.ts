import type { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/User'
import { verificarToken } from '@/lib/verificarToken'
import dbConnect from '@/lib/dbConnect'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()

    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const userId = verificarToken(token)

    const user = await User.findById(userId).select('_id nome email')

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.status(200).json(user)
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
