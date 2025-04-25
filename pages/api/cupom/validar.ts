import Cupom from "@/models/Cupom"
import dbConnect from "@/lib/dbConnect"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  const { codigo } = req.query

  if (typeof codigo !== 'string') return res.status(400).json({ valido: false, erro: 'Código inválido' })

  const cupom = await Cupom.findOne({ codigo: codigo.toUpperCase(), ativo: true })

  if (!cupom) return res.status(404).json({ erro: "Cupom não encontrado" })

  if (new Date(cupom.expiracao) < new Date()) return res.status(400).json({ erro: "Cupom expirado" })

  return res.status(200).json({ valido: true, desconto: cupom.desconto })
}