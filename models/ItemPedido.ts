import mongoose, { Schema, Document } from 'mongoose'

export interface ItemPedidoDocument extends Document {
  tipoItem: 'homenagem' | 'plaquinha' | 'chaveiro'
  produtoId: mongoose.Schema.Types.ObjectId
  nomeProduto: string
  quantidade: number
  precoUnitario: number
  homenagemId?: mongoose.Schema.Types.ObjectId
  pedidoId: mongoose.Schema.Types.ObjectId
}

const ItemPedidoSchema = new Schema({
  tipoItem: { type: String, enum: ['homenagem', 'plaquinha', 'chaveiro'], required: true },
  produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
  nomeProduto: { type: String, required: true },
  quantidade: { type: Number, default: 1 },
  precoUnitario: { type: Number, required: true },
  homenagemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Homenagem', default: null },
  pedidoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
}, { timestamps: true })

const ItemPedido = mongoose.models.ItemPedido || mongoose.model<ItemPedidoDocument>('ItemPedido', ItemPedidoSchema)
export default ItemPedido
