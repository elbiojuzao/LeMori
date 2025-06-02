import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import mongooseConnect from '@/lib/mongoose';
import User from '@/models/User';

const MELHORENVIO_TOKEN_URL = 'https://api.melhorenvio.com.br/oauth/token';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Código de autorização ausente ou inválido.' });
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.MELHORENVIO_CLIENT_ID!);
    params.append('client_secret', process.env.MELHORENVIO_CLIENT_SECRET!);
    params.append('redirect_uri', process.env.MELHORENVIO_REDIRECT_URI!);
    params.append('code', code);

    const response = await fetch(MELHORENVIO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error });
    }

    const tokenData = await response.json();

    const jwtToken = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: '7d' });

    await mongooseConnect();
    await User.findByIdAndUpdate(req.body.userId, {
      melhorEnvioToken: jwtToken
    });

    return res.status(200).json({
      message: 'Autorizado com sucesso!',
      melhorEnvio: tokenData,
      jwt: jwtToken,
    });
  } catch (error) {
    console.error('Erro ao trocar o código pelo token:', error);
    return res.status(500).json({ error: 'Erro interno ao processar autorização.' });
  }
}