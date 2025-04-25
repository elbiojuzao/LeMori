import Cupom from "@/models/Cupom"
import dbConnect from "@/lib/dbConnect"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  if (req.method === "GET") {
    const cupons = await Cupom.find()
    return res.status(200).json(cupons)
  }

  if (req.method === "POST") {
    try {
      const novoCupom = await Cupom.create(req.body)
      return res.status(201).json(novoCupom)
    } catch (err) {
      return res.status(400).json({ erro: "Os dados fornecidos são inválidos. Verifique as informações e tente novamente." })
    }
  }

  res.setHeader("Allow", ["GET", "POST"])
  res.status(405).end(`Método ${req.method} não permitido`)
}