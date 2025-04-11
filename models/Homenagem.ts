import mongoose, { Schema, Document } from 'mongoose'

export interface IHomenagem extends Document {
  nomeHomenageado: string
  dataNascimento: Date
  dataFalecimento: Date
  biografia: string
  fotoPerfil: string
  fotos: string[]
  musica: string
  criadoPor: mongoose.Types.ObjectId
}

const HomenagemSchema: Schema = new Schema(
  {
    nomeHomenageado: { type: String, required: true },
    dataNascimento: { type: Date, required: true },
    dataFalecimento: { type: Date, required: true },
    biografia: { type: String, required: true },
    fotoPerfil: { type: String, required: true }, 
    fotos: [{ type: String }],
    musica: { type: String },
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Homenagem ||
  mongoose.model<IHomenagem>('Homenagem', HomenagemSchema)
