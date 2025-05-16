import mongoose, { Schema } from 'mongoose'

export interface ICupom {
  _id?: string
  codigo: string
  tipoDesconto: 'porcentagem' | 'fixo'
  valorDesconto: number
  dataExpiracao: Date
  ativo: boolean
  comissao: {
    tipo: 'porcentagem' | 'fixo'
    valor: number
  }
  createdAt?: Date
  updatedAt?: Date
}

const CupomSchema = new Schema<ICupom>({
  codigo: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true 
  },
  tipoDesconto: { 
    type: String, 
    required: true, 
    enum: ['porcentagem', 'fixo'] 
  },
  valorDesconto: { 
    type: Number, 
    required: true,
    min: 0,
    validate: {
      validator: function(this: ICupom, v: number) {
        return !(this.tipoDesconto === 'porcentagem' && v > 100)
      },
      message: 'Desconto em porcentagem não pode ser maior que 100%'
    }
  },
  dataExpiracao: { 
    type: Date, 
    required: true 
  },
  ativo: { 
    type: Boolean, 
    default: true 
  },
  comissao: {
    tipo: {
      type: String,
      required: true,
      enum: ['porcentagem', 'fixo']
    },
    valor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(this: any, v: number) {
          return !(this.parent.tipo === 'porcentagem' && v > 100)
        },
        message: 'Comissão em porcentagem não pode ser maior que 100%'
      }
    }
  }
}, {
  timestamps: true
})

// Índice para busca rápida por código
CupomSchema.index({ codigo: 1 })

// Índice para busca de cupons ativos e não expirados
CupomSchema.index({ ativo: 1, dataExpiracao: 1 })

const Cupom = mongoose.models.Cupom || mongoose.model<ICupom>('Cupom', CupomSchema)
export default Cupom