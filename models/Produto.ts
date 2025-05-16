import mongoose, { Schema } from 'mongoose'

export interface IProduto {
  _id?: string
  nome: string
  descricao: string
  valor: number
  imagemUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

const ProdutoSchema = new Schema<IProduto>({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  imagemUrl: { type: String },
})

const Produto = mongoose.models.Produto || mongoose.model<IProduto>('Produto', ProdutoSchema)
export default Produto