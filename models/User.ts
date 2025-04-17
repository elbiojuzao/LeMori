import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  nome: string
  cpf: String
  rua: String
  numero: String
  complemento: String
  bairro: String
  cidade: String
  estado: String
  email: string
  senha: string
  homenagemCreditos: Number
  emailVerificado: Boolean
  emailToken?: string
  emailTokenExpira?: Date
}

const UserSchema = new Schema<IUser>({
  nome: { type: String, required: true },
  cpf: String,
  rua: String,
  numero: String,
  complemento: String,
  bairro: String,
  cidade: String,
  estado: String,
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  homenagemCreditos: { type: Number, default: 0 },
  emailVerificado: {
    type: Boolean,
    default: false,
  },
  emailToken: String,
  emailTokenExpira: Date,
})

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
