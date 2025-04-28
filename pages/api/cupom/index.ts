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
      const { codigo, tipo, valor, expiracao } = req.body;
  
      if (!codigo || !tipo || !valor || !expiracao) {
        return res.status(400).json({ erro: "Preencha todos os campos obrigatórios: código, desconto e validade." });
      }
  
      const cupomExistente = await Cupom.findOne({ codigo });
      if (cupomExistente) {
        return res.status(400).json({ erro: "Já existe um cupom com este código." });
      }
  
      const novoCupom = await Cupom.create({ codigo, tipo, valor, expiracao });
      return res.status(201).json(novoCupom);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro interno ao criar o cupom. Tente novamente mais tarde." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"])
  res.status(405).end(`Método ${req.method} não permitido`)
}