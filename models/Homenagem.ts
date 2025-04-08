import mongoose, { Schema, Document } from 'mongoose'

export interface IHomenagem extends Document {
  nomeHomenageado: string
  dataNascimento?: Date
  dataFalecimento?: Date
  biografia?: string
  fotos?: string[]
  musica?: string
}

const HomenagemSchema = new Schema<IHomenagem>({
  nomeHomenageado: { type: String, required: true },
  dataNascimento: Date,
  dataFalecimento: Date,
  biografia: String,
  fotos: [String],
  musica: String,
})

const Homenagem = mongoose.models.Homenagem || mongoose.model<IHomenagem>('Homenagem', HomenagemSchema)
export default Homenagem