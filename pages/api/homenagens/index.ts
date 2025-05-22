import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import path from 'path'
import fs from 'fs'
import { verifyToken } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import User from '@/models/User'
import Pedido from '@/models/Pedido'
import ItemPedido from '@/models/ItemPedido'
import slugify from 'slugify'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Função para garantir que o diretório de uploads existe
const ensureUploadDir = () => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  return uploadDir
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end('Método não permitido')

  const token = req.headers.authorization?.split(' ')[1]
  const decoded = await verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Não autorizado' })

  await dbConnect()

  const user = await User.findById(decoded.userId)
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  if (user.homenagemCreditos <= 0) {
    return res.status(403).json({ error: 'Você não possui créditos disponíveis para criar uma homenagem.' })
  }

  const uploadDir = ensureUploadDir()

  const form = new IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao processar formulário' })

    try {
      // Validação dos campos obrigatórios
      const nomeHomenageado = fields.nomeHomenageado?.toString()
      const dataNascimento = fields.dataNascimento?.toString()
      const dataFalecimento = fields.dataFalecimento?.toString()
      const biografia = fields.biografia?.toString()

      if (!nomeHomenageado) return res.status(400).json({ error: 'Nome do homenageado é obrigatório' })
      if (!dataNascimento) return res.status(400).json({ error: 'Data de nascimento é obrigatória' })
      if (!dataFalecimento) return res.status(400).json({ error: 'Data de falecimento é obrigatória' })
      if (!biografia) return res.status(400).json({ error: 'Biografia é obrigatória' })

      const fotoPerfilFile = Array.isArray(files.fotoPrincipal) ? files.fotoPrincipal[0] : files.fotoPrincipal
      const galeriaFiles = files.fotos as File[] || []

      const fotoPerfilPath = fotoPerfilFile?.filepath ? `/uploads/${path.basename(fotoPerfilFile.filepath)}` : ''

      const fotosPaths = Array.isArray(galeriaFiles)
        ? galeriaFiles.map((file) => `/uploads/${path.basename(file.filepath)}`)
        : []

      // Gera um slug único para a homenagem
      const baseSlug = slugify(nomeHomenageado, { lower: true, strict: true })
      let slug = baseSlug
      let counter = 1
      
      while (await Homenagem.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }

      const novaHomenagem = new Homenagem({
        nomeHomenageado,
        dataNascimento,
        dataFalecimento,
        biografia,
        musica: fields.musica?.toString() || '',
        fotoPerfil: fotoPerfilPath,
        fotos: fotosPaths,
        criadoPor: decoded.userId,
        dataExpiracao: new Date(Date.now() + 1825 * 24 * 60 * 60 * 1000),
        slug,
        ativo: true
      })

      // Buscar um pedido pago do usuário com item de homenagem sem homenagemId
      const pedidoComHomenagemPendente = await Pedido.findOne({
        userId: user._id,
        statusPagamento: 'pago',
      }).populate({
        path: 'itensPedido',
        model: 'ItemPedido',
        match: { tipoItem: 'homenagem', homenagemId: { $exists: false } },
      })

      if (!pedidoComHomenagemPendente || pedidoComHomenagemPendente.itensPedido.length === 0) {
        return res.status(400).json({ error: 'Nenhum pedido pago com homenagem pendente encontrado para este usuário.' });
      }

      const homenagemSalva = await novaHomenagem.save()
      const itemPedidoParaAtualizar = pedidoComHomenagemPendente.itensPedido[0]
      await ItemPedido.findByIdAndUpdate(itemPedidoParaAtualizar._id, { homenagemId: homenagemSalva._id })
      novaHomenagem.pedidoIds.push(pedidoComHomenagemPendente._id)
      await novaHomenagem.save()

      user.homenagemCreditos -= 1
      await user.save()

      return res.status(201).json(homenagemSalva)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar homenagem'
      res.status(500).json({ message: errorMessage })
    }
  })
}

export default handler