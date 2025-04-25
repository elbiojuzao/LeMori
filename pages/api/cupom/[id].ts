import Cupom from "@/models/Cupom"
import dbConnect from "@/lib/dbConnect"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { id } = req.query

  if (req.method === "GET") {
    const cupom = await Cupom.findById(id)
    if (!cupom) return res.status(404).json({ erro: "Cupom não encontrado" })
    return res.status(200).json(cupom)
  }

  if (req.method === "PUT") {
    try {
      const atualizado = await Cupom.findByIdAndUpdate(id, req.body, { new: true })
      if (!atualizado) return res.status(404).json({ erro: "Cupom não encontrado" })
      return res.status(200).json(atualizado)
    } catch (err) {
      return res.status(400).json({ erro: "Os dados fornecidos são inválidos. Verifique as informações e tente novamente." })
    }
  }

  if (req.method === "DELETE") {
    const deletado = await Cupom.findByIdAndDelete(id)
    if (!deletado) return res.status(404).json({ erro: "Cupom não encontrado" })
    return res.status(204).end()
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"])
  res.status(405).end(`Método ${req.method} não permitido`)
}