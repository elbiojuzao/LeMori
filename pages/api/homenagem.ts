// pages/api/homenagem.ts
import { NextApiRequest, NextApiResponse } from 'next'
import Homenagem from '@/models/Homenagem'
import mongooseConnect from '@/lib/mongoose'
import formidable, { File } from 'formidable'

export const config = {
  api: {
    bodyParser: false, // necessário para usar formidable
  },
}

// Função auxiliar para parsear o FormData
const parseForm = async (req: NextApiRequest): Promise<{ fields: any, files: any }> => {
  const form = formidable({ multiples: true })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect()

  if (req.method === 'POST') {
    try {
      const { fields } = await parseForm(req)

      const {
        nome,
        nascimento,
        falecimento,
        mensagem,
        musicaLink,
      } = fields

      const novaHomenagem = await Homenagem.create({
        nomeHomenageado: nome,
        dataNascimento: new Date(nascimento),
        dataFalecimento: new Date(falecimento),
        biografia: mensagem,
        imagemURL: '', // você pode salvar futuramente com Cloudinary, S3 etc.
        criadoPor: 'teste@example.com' // substituir pelo usuário autenticado
      })

      return res.status(201).json(novaHomenagem)

    } catch (error) {
      console.error('Erro ao salvar homenagem:', error)
      return res.status(500).json({ mensagem: 'Erro interno do servidor', error })
    }

  } else {
    return res.status(405).json({ mensagem: 'Método não permitido' })
  }
}
