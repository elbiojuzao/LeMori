import { Schema, model, models } from 'mongoose'

export interface IProduto {
  _id: string
  nome: string
  descricao: string
  preco: number
  precoPromocional?: number
  promocaoAtiva: boolean
  inicioPromocao?: Date
  fimPromocao?: Date
  destaque: boolean
  createdAt: string
  updatedAt: string
  isFisico: boolean
  largura?: number    // em centímetros
  altura?: number     // em centímetros
  comprimento?: number // em centímetros
  peso?: number       // em gramas
  imagens?: string[]  // Caminhos das imagens do produto
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
  promocaoAtiva: {
    type: Boolean,
    default: false
  },
  inicioPromocao: {
    type: Date,
    validate: {
      validator: function(this: any, val: Date) {
        if (!this.promocaoAtiva) return true;
        if (!val) return false;
        if (this.fimPromocao && val >= this.fimPromocao) return false;
        return true;
      },
      message: 'Data de início da promoção inválida'
    }
  },
  fimPromocao: {
    type: Date,
    validate: {
      validator: function(this: any, val: Date) {
        if (!this.promocaoAtiva) return true;
        if (!val) return false;
        if (this.inicioPromocao && val <= this.inicioPromocao) return false;
        return true;
      },
      message: 'Data de fim da promoção inválida'
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
  destaque: {
    type: Boolean,
    default: false
  },
  estoque: {
    type: Number,
    required: [true, 'Estoque é obrigatório'],
    min: [0, 'Estoque não pode ser negativo']
  },
  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória']
  },
  isFisico: {
    type: Boolean,
    required: [true, 'É necessário informar se o produto é físico ou não'],
    default: false
  },
  largura: {
    type: Number,
    required: function(this: any) {
      return this.isFisico;
    },
    min: [0, 'Largura não pode ser negativa'],
    validate: {
      validator: function(this: any, val: number) {
        return !this.isFisico || (val !== undefined && val !== null);
      },
      message: 'Largura é obrigatória para produtos físicos'
    }
  },
  altura: {
    type: Number,
    required: function(this: any) {
      return this.isFisico;
    },
    min: [0, 'Altura não pode ser negativa'],
    validate: {
      validator: function(this: any, val: number) {
        return !this.isFisico || (val !== undefined && val !== null);
      },
      message: 'Altura é obrigatória para produtos físicos'
    }
  },
  comprimento: {
    type: Number,
    required: function(this: any) {
      return this.isFisico;
    },
    min: [0, 'Comprimento não pode ser negativo'],
    validate: {
      validator: function(this: any, val: number) {
        return !this.isFisico || (val !== undefined && val !== null);
      },
      message: 'Comprimento é obrigatório para produtos físicos'
    }
  },
  peso: {
    type: Number,
    required: function(this: any) {
      return this.isFisico;
    },
    min: [0, 'Peso não pode ser negativo'],
    validate: {
      validator: function(this: any, val: number) {
        return !this.isFisico || (val !== undefined && val !== null);
      },
      message: 'Peso é obrigatório para produtos físicos'
    }
  }
}, {
  timestamps: true
})

export default models.Produto || model('Produto', ProdutoSchema)