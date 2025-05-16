import React, { useState, useEffect } from 'react';
import { Search, Calendar, ExternalLink, Eye, EyeOff } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminRoute from '@/components/AdminRoute';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Homenagem {
  _id: string
  nome: string
  historia: string
  fotos: string[]
  userId: string
  userName: string
  dataNascimento?: string
  dataFalecimento?: string
  createdAt: string
  ativo: boolean
  slug: string
}

const WebPages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [homenagens, setHomenagens] = useState<Homenagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    carregarHomenagens();
  }, []);

  const carregarHomenagens = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }

      const response = await fetch('/api/admin/homenagens', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        throw new Error('Você não tem permissão para acessar esta área.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar homenagens');
      }
      
      const data = await response.json();
      setHomenagens(data);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao carregar homenagens:', error);
      setError(error.message);
      setLoading(false);
      toast.error(error.message);
      
      // Se for erro de autenticação, redireciona para login
      if (error.message.includes('login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };
  
  // Filter homenagens based on search term
  const filteredHomenagens = homenagens.filter(homenagem => 
    homenagem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homenagem.historia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homenagem.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Toggle homenagem visibility
  const handleToggleVisibility = async (homenagemId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`/api/admin/homenagens/${homenagemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ativo: !currentStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar visibilidade da homenagem');
      }

      toast.success('Visibilidade atualizada com sucesso!');
      carregarHomenagens();
    } catch (error: any) {
      console.error('Erro ao atualizar visibilidade:', error);
      toast.error(error.message || 'Erro ao atualizar visibilidade da homenagem');
    }
  };
  
  return (
    <AdminRoute>
      <AdminLayout currentPage="web-pages">
        <div className="py-6">
          <div className="px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Homenagens</h1>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, história ou autor da homenagem"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                />
              </div>
            </div>
            
            {/* Homenagens Table */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : filteredHomenagens.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Homenagem
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Autor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data da Homenagem
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHomenagens.map((homenagem) => (
                        <tr key={homenagem._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                                <img 
                                  src={homenagem.fotos[0] || '/placeholder.jpg'} 
                                  alt={homenagem.nome} 
                                  className="h-10 w-10 object-cover"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{homenagem.nome}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {homenagem.historia.substring(0, 60)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link href={`/admin/usuarios/${homenagem.userId}`} className="text-purple-600 hover:text-purple-900">
                              {homenagem.userName}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1 text-gray-400" />
                              {format(new Date(homenagem.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => handleToggleVisibility(homenagem._id, homenagem.ativo)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                homenagem.ativo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {homenagem.ativo ? (
                                <>
                                  <Eye size={12} className="mr-1" />
                                  Ativa
                                </>
                              ) : (
                                <>
                                  <EyeOff size={12} className="mr-1" />
                                  Inativa
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {homenagem.ativo && (
                              <a 
                                href={`/homenagem/${homenagem.slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                              >
                                Ver Homenagem
                                <ExternalLink size={14} className="ml-1" />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">Nenhuma homenagem encontrada com os critérios informados</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Limpar Busca
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Nota: Para fins de moderação de conteúdo, esta visualização é somente leitura com ações limitadas. O gerenciamento de conteúdo deve seguir as diretrizes da plataforma.</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default WebPages;