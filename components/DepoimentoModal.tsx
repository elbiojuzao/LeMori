import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface DepoimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepoimentoModal({ isOpen, onClose }: DepoimentoModalProps) {
  const [depoimento, setDepoimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Você precisa estar logado para deixar um depoimento');
        return;
      }

      await axios.post('/api/depoimentos/criar', 
        { depoimento },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(true);
      setDepoimento('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar depoimento');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Deixe seu depoimento
        </h2>

        {success ? (
          <div className="text-green-600 text-center py-4">
            Depoimento enviado com sucesso! Aguarde a aprovação.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="depoimento"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Seu depoimento
              </label>
              <textarea
                id="depoimento"
                value={depoimento}
                onChange={(e) => setDepoimento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-900"
                rows={4}
                required
                placeholder="Conte-nos sua experiência..."
              />
            </div>

            {error && (
              <div className="text-red-600 mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 