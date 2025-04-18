import mongoose, { Schema, Document } from 'mongoose'

export interface AddressDocument extends Document {
  cep: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  userId: mongoose.Schema.Types.ObjectId
}

const AddressSchema = new Schema({
  cep: { type: String, required: true },
  rua: { type: String, required: true },
  numero: { type: String, required: true },
  complemento: { type: String },
  bairro: { type: String, required: true },
  cidade: { type: String, required: true },
  estado: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
})

const Address = mongoose.models.Address || mongoose.model<AddressDocument>('Address', AddressSchema)

export default Address