import mongoose, { Schema, Document } from 'mongoose'

export interface ItemPedidoDocument extends Document {
  produtoId: mongoose.Schema.Types.ObjectId
  nomeProduto: string
  quantidade: number
  valorUnitario: number
  pedidoId: mongoose.Schema.Types.ObjectId
  tipoItem: 'homenagem' | 'fisico'
}

const ItemPedidoSchema = new Schema({
  produtoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produto',
    required: true
  },
  nomeProduto: {
    type: String,
    required: true
  },
  quantidade: {
    type: Number,
    required: true,
    min: [1, 'Quantidade deve ser maior que zero']
  },
  valorUnitario: {
    type: Number,
    required: true,
    min: [0, 'Valor unitário não pode ser negativo']
  },
  pedidoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pedido',
    required: true
  },
  tipoItem: {
    type: String,
    enum: ['homenagem', 'fisico'],
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.models.ItemPedido || mongoose.model('ItemPedido', ItemPedidoSchema)
