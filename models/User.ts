import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  nome: string
  email: string
  senha: string
}

const UserSchema = new Schema<IUser>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
})

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
