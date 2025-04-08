import type { NextApiRequest, NextApiResponse } from 'next';
import mongooseConnect from '@/lib/mongoose'; 
import { Homenagem } from '@/models/Homenagem';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect();

  if (req.method === 'POST') {
    try {
      const novaHomenagem = await Homenagem.create(req.body);
      return res.status(201).json({ ok: true, data: novaHomenagem });
    } catch (error) {
      return res.status(500).json({ ok: false, error: 'Erro ao criar homenagem.' });
    }
  }

  if (req.method === 'GET') {
    try {
      const homenagens = await Homenagem.find().sort({ createdAt: -1 });
      return res.status(200).json({ ok: true, data: homenagens });
    } catch (error) {
      return res.status(500).json({ ok: false, error: 'Erro ao buscar homenagens.' });
    }
  }

  return res.status(405).json({ ok: false, error: 'Método não permitido' });
}
