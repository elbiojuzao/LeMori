import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  nome: string
  cpf?: string
  email: string
  senha: string
  homenagemCreditos: number
  emailVerificado: boolean
  emailToken?: string
  emailTokenExpira?: Date
  dataCriada: Date
  dataModificacao: Date
  quantidadeHomenagens: number
  dataNascimento?: Date
  ultimoLogin?: Date
  ultimaHomenagem?: string
  statusConta: 'ativo' | 'inativo'
  isAdmin: boolean
  foto?: string
}

const UserSchema = new Schema<IUser>({
  nome: { 
    type: String, 
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres']
  },
  cpf: { 
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true // CPF é opcional
        const cpf = v.replace(/[^\d]/g, '')
        if (cpf.length !== 11) return false
        if (/^(\d)\1{10}$/.test(cpf)) return false

        let soma = 0
        for (let i = 0; i < 9; i++) {
          soma += parseInt(cpf.charAt(i)) * (10 - i)
        }
        let resto = 11 - (soma % 11)
        let digitoVerificador1 = resto > 9 ? 0 : resto
        if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false

        soma = 0
        for (let i = 0; i < 10; i++) {
          soma += parseInt(cpf.charAt(i)) * (11 - i)
        }
        resto = 11 - (soma % 11)
        let digitoVerificador2 = resto > 9 ? 0 : resto
        if (digitoVerificador2 !== parseInt(cpf.charAt(10))) return false

        return true
      },
      message: 'CPF inválido'
    }
  },
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  senha: { 
    type: String, 
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
  },
  homenagemCreditos: { 
    type: Number, 
    default: 0,
    min: [0, 'Créditos não podem ser negativos']
  },
  emailVerificado: {
    type: Boolean,
    default: false,
  },
  emailToken: String,
  emailTokenExpira: Date,
  dataCriada: { 
    type: Date, 
    default: Date.now 
  },
  dataModificacao: { 
    type: Date, 
    default: Date.now 
  },
  quantidadeHomenagens: { 
    type: Number, 
    default: 0,
    min: [0, 'Quantidade de homenagens não pode ser negativa']
  },
  dataNascimento: { 
    type: Date,
    get: (v: Date) => {
      if (!v) return v;
      const date = new Date(v);
      date.setHours(date.getHours() + 3); // Ajusta para o fuso horário do Brasil
      return date.toISOString().split('T')[0];
    },
    set: (v: string) => v ? new Date(v) : v,
    validate: {
      validator: function(v: Date) {
        if (!v) return true // Data de nascimento é opcional
        return v < new Date()
      },
      message: 'Data de nascimento inválida'
    }
  },
  ultimoLogin: Date,
  ultimaHomenagem: String,
  statusConta: {
    type: String,
    enum: ['ativo', 'inativo'],
    default: 'ativo',
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  foto: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true // Foto é opcional
        return v.startsWith('/uploads/profiles/')
      },
      message: 'Caminho da foto inválido'
    }
  }
}, { 
  timestamps: true 
})

// Índices para melhorar a performance das consultas
UserSchema.index({ email: 1 })
UserSchema.index({ cpf: 1 })
UserSchema.index({ statusConta: 1 })

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
