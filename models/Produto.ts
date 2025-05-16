import { Schema, model, models } from 'mongoose'

export interface IProduto {
  _id: string
  nome: string
  descricao: string
  valor: number
  createdAt: string
  updatedAt: string
}

const ProdutoSchema = new Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres']
  },
  descricao: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    minlength: [10, 'Descrição deve ter no mínimo 10 caracteres']
  },
  valor: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    min: [0, 'Valor não pode ser negativo']
  },
  preco: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  precoPromocional: {
    type: Number,
    min: [0, 'Preço promocional não pode ser negativo'],
    validate: {
      validator: function(this: any, val: number) {
        return !val || val < this.preco
      },
      message: 'Preço promocional deve ser menor que o preço normal'
    }
  },
  imagens: {
    type: [String],
    required: [true, 'Pelo menos uma imagem é obrigatória'],
    validate: {
      validator: function(v: string[]) {
        return v.length > 0
      },
      message: 'Pelo menos uma imagem é obrigatória'
    }
  },
  ativo: {
    type: Boolean,
    default: true
  },
  estoque: {
    type: Number,
    required: [true, 'Estoque é obrigatório'],
    min: [0, 'Estoque não pode ser negativo']
  },
  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória']
  }
}, {
  timestamps: true
})

export default models.Produto || model('Produto', ProdutoSchema)