import mongoose, { Schema, Document } from 'mongoose'

export interface HomenagemDocument extends Document {
  nomeHomenageado: string
  biografia: string
  dataNascimento: Date
  dataFalecimento: Date
  fotos: string[]
  musica?: string
  criadoPor: mongoose.Schema.Types.ObjectId
  pedidoIds: mongoose.Schema.Types.ObjectId[]
  dataExpiracao: Date
  createdAt: Date
  ativo: boolean
  slug: string
  excluida?: boolean
}

const HomenagemSchema = new Schema<HomenagemDocument>({
  nomeHomenageado: { type: String, required: true },
  biografia: { type: String, required: true },
  dataNascimento: { type: Date, required: true },
  dataFalecimento: { type: Date, required: true },
  fotos: [{ type: String }],
  musica: { type: String },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pedidoIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' }],
  dataExpiracao: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  ativo: { type: Boolean, default: true },
  slug: { type: String, required: true, unique: true },
  excluida: { type: Boolean, default: false }
})

const Homenagem = mongoose.models.Homenagem || mongoose.model<HomenagemDocument>('Homenagem', HomenagemSchema)

export default Homenagem