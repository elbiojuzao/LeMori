import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'
import formidable from 'formidable'
import { v2 as cloudinary } from 'cloudinary'

// Configura o Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Verifica o token e se é admin
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    const decodedToken = await verifyToken(token)
    if (!decodedToken || !decodedToken.isAdmin) {
      return res.status(403).json({ message: 'Acesso restrito a administradores' })
    }

    // Processa o upload dos arquivos
    const form = formidable({ multiples: true })
    const { files } = await new Promise<{ files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, _, files) => {
        if (err) reject(err)
        resolve({ files })
      })
    })

    // Faz upload das imagens para o Cloudinary
    const uploadPromises = Object.values(files).map(async (fileOrArray) => {
      const file = Array.isArray(fileOrArray) ? fileOrArray[0] : fileOrArray
      if (!file || typeof file !== 'object' || !('filepath' in file)) {
        throw new Error('Arquivo inválido')
      }
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'produtos',
        resource_type: 'auto'
      })
      return result.secure_url
    })

    const urls = await Promise.all(uploadPromises)
    return res.status(200).json({ urls })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload do arquivo'
    res.status(500).json({ message: errorMessage })
  }
} 