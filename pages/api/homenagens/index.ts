import { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File } from 'formidable'
import path from 'path'
import { verifyToken } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end('Método não permitido')

  const token = req.headers.authorization?.split(' ')[1]
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Não autorizado' })

  await dbConnect()

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir: './public/uploads',
    keepExtensions: true,
  })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao processar formulário' })

    try {
      const fotoPerfilFile = Array.isArray(files.fotoPerfil) ? files.fotoPerfil[0] : files.fotoPerfil
      const galeriaFiles = files.fotos as File[] || []

      const fotoPerfilPath = fotoPerfilFile
        ? `/uploads/${path.basename(fotoPerfilFile.filepath)}`
        : ''

      const fotosPaths = Array.isArray(galeriaFiles)
        ? galeriaFiles.map((file) => `/uploads/${path.basename(file.filepath)}`)
        : []

      const novaHomenagem = new Homenagem({
        nomeHomenageado: fields.nomeHomenageado?.toString(),
        dataNascimento: fields.dataNascimento?.toString(),
        dataFalecimento: fields.dataFalecimento?.toString(),
        biografia: fields.biografia?.toString(),
        musica: fields.musica?.toString(),
        fotoPerfil: fotoPerfilPath,
        fotos: fotosPaths,
        criadoPor: decoded.userId,
      })

      await novaHomenagem.save()
      return res.status(201).json(novaHomenagem)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar homenagem' })
    }
  })
}

export default handler
