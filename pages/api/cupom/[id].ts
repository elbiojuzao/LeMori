import Cupom from "@/models/Cupom"
import dbConnect from "@/lib/dbConnect"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { id } = req.query

  if (req.method === "GET" && id) {
    try {
      const cupom = await Cupom.findById(id);
      if (!cupom) return res.status(404).json({ erro: "Cupom não encontrado" })
      return res.status(200).json(cupom)
    } catch (error) {
      console.error("Erro ao buscar cupom por ID:", error)
      return res.status(500).json({ erro: "Houve um erro ao buscar o cupom." })
    }
  }

  if (req.method === "PUT" && id) {
    try {
      const atualizado = await Cupom.findByIdAndUpdate(id, req.body, { new: true })
      if (!atualizado) return res.status(404).json({ erro: "Cupom não encontrado" })
      return res.status(200).json(atualizado)
    } catch {
      return res.status(500).json({ message: 'Erro ao validar cupom' });
    }
  }

  if (req.method === "DELETE" && id) {
    try {
      const deletado = await Cupom.findByIdAndDelete(id);
      if (!deletado) return res.status(404).json({ erro: "Cupom não encontrado" })
      return res.status(204).end();
    } catch (error) {
      console.error("Erro ao deletar cupom:", error)
      return res.status(500).json({ erro: "Houve um erro ao deletar o cupom." })
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"])
  res.status(405).end(`Método ${req.method} não permitido`)
}