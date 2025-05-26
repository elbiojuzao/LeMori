import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DepoimentoModal from '@/components/DepoimentoModal';
import { IDepoimento } from '@/models/Depoimento';
import axios from 'axios';
import Image from 'next/image';

interface Usuario {
  _id: string;
  nome: string;
  foto?: string;
}

interface DepoimentoCompleto extends Omit<IDepoimento, 'usuario'> {
  usuario: Usuario;
}

export default function Depoimentos() {
  const [depoimentos, setDepoimentos] = useState<DepoimentoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDepoimentoModalOpen, setIsDepoimentoModalOpen] = useState(false);

  useEffect(() => {
    async function loadDepoimentos() {
      try {
        const response = await axios.get('/api/depoimentos?limit=20');
        setDepoimentos(response.data);
      } catch (err) {
        console.error('Erro ao carregar depoimentos:', err);
        setError('Erro ao carregar depoimentos. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    loadDepoimentos();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Depoimentos</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Veja o que nossos clientes têm a dizer sobre a nossa plataforma.
            </p>
            <button
              onClick={() => setIsDepoimentoModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-150"
            >
              <MessageSquare size={20} className="mr-2" />
              Deixe seu depoimento
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {depoimentos.map((depoimento) => (
                <div key={depoimento._id} className="bg-white p-8 rounded-lg shadow-md relative">
                  <div className="text-purple-600 absolute -top-4 left-8">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 20H7.5C6.12 20 5 18.88 5 17.5V12.5C5 11.12 6.12 10 7.5 10H12.5C13.88 10 15 11.12 15 12.5V17.5C15 18.88 13.88 20 12.5 20ZM17.5 30H12.5C11.12 30 10 28.88 10 27.5V22.5C10 21.12 11.12 20 12.5 20H17.5C18.88 20 20 21.12 20 22.5V27.5C20 28.88 18.88 30 17.5 30ZM27.5 20H22.5C21.12 20 20 18.88 20 17.5V12.5C20 11.12 21.12 10 22.5 10H27.5C28.88 10 30 11.12 30 12.5V17.5C30 18.88 28.88 20 27.5 20ZM32.5 30H27.5C26.12 30 25 28.88 25 27.5V22.5C25 21.12 26.12 20 27.5 20H32.5C33.88 20 35 21.12 35 22.5V27.5C35 28.88 33.88 30 32.5 30Z" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-6 mt-4">
                    &ldquo;{depoimento.depoimento}&rdquo;
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                      {depoimento.usuario.foto ? (
                        <Image 
                          src={depoimento.usuario.foto} 
                          alt={depoimento.usuario.nome} 
                          width={48}
                          height={48}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                          <span className="text-lg text-purple-600">
                            {depoimento.usuario.nome.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{depoimento.usuario.nome}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <DepoimentoModal 
        isOpen={isDepoimentoModalOpen} 
        onClose={() => setIsDepoimentoModalOpen(false)} 
      />
    </>
  );
} 