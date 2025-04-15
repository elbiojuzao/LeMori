import mongoose, { Schema, Document } from 'mongoose'

export interface IHomenagem extends Document {
  nomeHomenageado: string
  dataNascimento: Date
  dataFalecimento: Date
  biografia?: string
  fotoPerfil?: string
  fotos: string[]
  musica?: string
  criadoPor: mongoose.Types.ObjectId
  dataCriada: Date
  excluida: boolean
  expirada?: boolean 
}

const HomenagemSchema: Schema = new Schema(
  {
    nomeHomenageado: { type: String, required: true },
    dataNascimento: { type: Date, required: true },
    dataFalecimento: { type: Date, required: true },
    biografia: { type: String, required: false }, 
    fotoPerfil: { type: String}, 
    fotos: [{ type: String }],
    musica: { type: String },
    criadoPor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    dataCriada: {
      type: Date,
      default: Date.now,
      immutable: true,},
    excluida: {
      type: Boolean,
      default: false,
    },
    foiNotificadoExpiracao: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

HomenagemSchema.virtual('expirada').get(function (this: IHomenagem) {
  if (!this.dataCriada) return false
  const agora = new Date()
  const expiracao = new Date(this.dataCriada)
  expiracao.setFullYear(expiracao.getFullYear() + 5)
  return agora > expiracao
})

export default mongoose.models.Homenagem ||
  mongoose.model<IHomenagem>('Homenagem', HomenagemSchema)