import mongoose from 'mongoose'

const EnderecoSchema = new mongoose.Schema({
  cep: { type: String, required: true },
  rua: { type: String, required: true },
  numero: { type: String, required: true },
  complemento: { type: String },
  bairro: { type: String, required: true },
  cidade: { type: String, required: true },
  estado: { type: String, required: true },
}, { _id: false })

const PedidoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dataCompra: { type: Date, default: Date.now },
  statusPagamento: {
    type: String,
    enum: [
      'pendente',
      'aprovado',
      'em_processamento',
      'rejeitado',
      'cancelado',
      'estornado'
    ],
    default: 'pendente',
  },
  statusPedido: {
    type: String,
    enum: [
      'em_producao',
      'pronto_para_envio',
      'enviado',
      'entregue',
      'cancelado'
    ],
    default: 'em_producao',
  },
  valorTotal: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v: any) => parseFloat(v.toString()),
    set: (v: number) => v.toFixed(2),
  },
  enderecoEntrega: {type: EnderecoSchema,required: true},
  contemItensFisicos: {type: Boolean,default: false}
}, { timestamps: true })

PedidoSchema.set('toJSON', { getters: true })

export default mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema)