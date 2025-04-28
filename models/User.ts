import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  nome: string
  cpf: String
  email: string
  senha: { type: String, select: false } // Evita retornar senha acidentalmente
  homenagemCreditos: Number
  emailVerificado: Boolean
  emailToken?: string
  emailTokenExpira?: Date
}

const UserSchema = new Schema<IUser>({
  nome: { type: String, required: true },
  cpf: String,
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  homenagemCreditos: { type: Number, default: 0 },
  emailVerificado: {
    type: Boolean,
    default: false,
  },
  emailToken: String,
  emailTokenExpira: Date,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
