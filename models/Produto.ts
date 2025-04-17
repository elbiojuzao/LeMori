import mongoose, { Schema, Document } from 'mongoose'

export interface IProduto extends Document {
  nome: string
  descricao: string
  valor: number
}

const ProdutoSchema = new Schema<IProduto>({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
})

const Produto = mongoose.models.Produto || mongoose.model<IProduto>('Produto', ProdutoSchema)
export default Produto