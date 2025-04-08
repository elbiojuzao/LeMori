import mongoose, { Schema, models } from 'mongoose';

const HomenagemSchema = new Schema({
  nomeHomenageado: { type: String, required: true },
  dataNascimento: { type: Date, required: true },
  dataFalecimento: { type: Date, required: true },
  biografia: { type: String },
  imagemURL: { type: String },
  criadoPor: { type: String, required: true }, // e-mail ou ID do usuário
}, {
  timestamps: true // cria createdAt e updatedAt automaticamente
});

export const Homenagem = models.Homenagem || mongoose.model('Homenagem', HomenagemSchema);
