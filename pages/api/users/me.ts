import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token não fornecido' })

  try {
    const decoded: any = verifyToken(token)
    const userId = decoded.id

    if (req.method === 'PUT') {
      const {
        nome,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      } = req.body

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          nome,
          rua,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
        },
        { new: true }
      )

      return res.status(200).json({ user: updatedUser })
    }

    return res.status(405).json({ message: 'Método não permitido' })
  } catch (err) {
    console.error(err)
    return res.status(401).json({ message: 'Token inválido' })
  }
}