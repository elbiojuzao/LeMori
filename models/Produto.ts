import mongoose, { Schema } from 'mongoose'

export interface IProduto {
  _id?: string
  nome: string
  descricao: string
  valor: number
  imagemUrl?: string
  destaque?: boolean
  createdAt?: Date
  updatedAt?: Date
}

const ProdutoSchema = new Schema<IProduto>({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  imagemUrl: { type: String },
  destaque: { type: Boolean, default: false },
}, {
  timestamps: true
})

const Produto = mongoose.models.Produto || mongoose.model<IProduto>('Produto', ProdutoSchema)
export default Produto