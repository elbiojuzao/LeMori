import mongoose from "mongoose"

const CupomSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  tipo: { type: String, enum: ["porcentagem", "valor"], required: true },
  valor: { type: Number, required: true }, // 10 = R$10 ou 10%
  expiracao: { type: Date, required: true },
  ativo: { type: Boolean, default: true }
})

export default mongoose.models.Cupom || mongoose.model("Cupom", CupomSchema)