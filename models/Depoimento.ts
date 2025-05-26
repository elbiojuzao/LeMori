import mongoose from 'mongoose';

const depoimentoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  depoimento: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['aprovado', 'pendente', 'rejeitado'],
    default: 'pendente',
  },
  excluido: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Força a limpeza do modelo existente
delete mongoose.models.Depoimento;

export const Depoimento = mongoose.model('Depoimento', depoimentoSchema);

export interface IDepoimento {
  _id?: string;
  usuario: string;
  depoimento: string;
  status?: 'aprovado' | 'pendente' | 'rejeitado';
  excluido?: boolean;
  createdAt?: Date;
} 