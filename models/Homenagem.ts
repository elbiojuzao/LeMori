import mongoose, { Schema, Document, models } from 'mongoose'

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

const Homenagem =
  models.Homenagem || mongoose.model<IHomenagem>('Homenagem', HomenagemSchema)

export default Homenagem
