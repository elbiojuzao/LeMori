import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import calculateShipping from '@/lib/melhorenvio/calculate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { from, to, products } = req.body;

    if (!from?.cep || !to?.cep) {
      return res.status(400).json({ error: 'CEPs de origem e destino são obrigatórios' });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Nenhum produto fornecido para cálculo de frete' });
    }

    // Obter token do Melhor Envio do usuário
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { melhorEnvioToken: string };
    if (!decoded.melhorEnvioToken) {
      return res.status(401).json({ error: 'Token do Melhor Envio não encontrado' });
    }

    const shippingOptions = await calculateShipping({
      accessToken: decoded.melhorEnvioToken,
      from,
      to,
      products
    });

    return res.status(200).json(shippingOptions);
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro ao calcular frete' 
    });
  }
}
