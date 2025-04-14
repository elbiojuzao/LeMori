import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import path from 'path'
import { verifyToken } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import User from '@/models/User'

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

  const user = await User.findById(decoded.userId)
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  if (user.homenagemCreditos <= 0) {
    return res.status(403).json({ error: 'Você não possui créditos disponíveis para criar uma homenagem.' })
  }

  const form = new IncomingForm({
    multiples: true,
    uploadDir: './public/uploads',
    keepExtensions: true,
  })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao processar formulário' })

    try {
      const fotoPerfilFile = Array.isArray(files.fotoPrincipal) ? files.fotoPrincipal[0] : files.fotoPrincipal
      const galeriaFiles = files.fotos as File[] || []

      const fotoPerfilPath = fotoPerfilFile?.filepath ? `/uploads/${path.basename(fotoPerfilFile.filepath)}` : ''

      const fotosPaths = Array.isArray(galeriaFiles)
        ? galeriaFiles.map((file) => `/uploads/${path.basename(file.filepath)}`)
        : []

      const novaHomenagem = new Homenagem({
        nomeHomenageado: fields.nomeHomenageado?.toString() || '',
        dataNascimento: fields.dataNascimento?.toString() || '',
        dataFalecimento: fields.dataFalecimento?.toString() || '',
        biografia: fields.biografia?.toString() || '',
        musica: fields.musica?.toString() || '',
        fotoPerfil: fotoPerfilPath,
        fotos: fotosPaths,
        criadoPor: decoded.userId,
      })

      await novaHomenagem.save()

      user.homenagemCreditos -= 1
      await user.save()

      return res.status(201).json(novaHomenagem)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar homenagem' })
    }
  })
}

export default handler
