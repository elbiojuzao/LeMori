import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    })

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    const file = files.file as formidable.File
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    const fileName = `${uuidv4()}${path.extname(file.originalFilename || '')}`
    const newPath = path.join(process.cwd(), 'public/uploads', fileName)

    fs.renameSync(file.filepath, newPath)

    res.status(200).json({
      url: `/uploads/${fileName}`,
      fileName,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload'
    res.status(500).json({ error: errorMessage })
  }
} 