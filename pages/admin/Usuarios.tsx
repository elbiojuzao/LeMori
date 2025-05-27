import React, { useState, useEffect, useCallback } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminRoute from '@/components/AdminRoute';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import UsuarioDetalhesModal from '@/components/UsuarioDetalhesModal';
import Image from 'next/image';

interface Usuario {
  _id: string;
  nome: string;
  email: string;
  cpf?: string;
  dataNascimento?: string;
  createdAt: string;
  quantidadeHomenagens: number;
  statusConta: 'ativo' | 'inativo';
  isAdmin: boolean;
  foto?: string;
  homenagemCreditos?: number;
  emailVerificado?: boolean;
  ultimoLogin?: string;
  ultimaHomenagem?: string;
}

interface UsuarioDetalhado extends Usuario {
  pedidos?: Array<{
    _id: string;
    dataCompra: string;
    statusPagamento: string;
    statusPedido: string;
    valorTotal: number;
  }>;
  homenagens?: Array<{
    _id: string;
    nomeHomenageado: string;
    dataCriacao: string;
    ativo: boolean;
  }>;
  depoimentos?: Array<{
    _id: string;
    depoimento: string;
    status: string;
    dataCriacao: string;
  }>;
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    dataCriacaoInicio: '',
    dataCriacaoFim: '',
    dataNascimentoInicio: '',
    dataNascimentoFim: '',
    minHomenagens: ''
  });
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioDetalhado | null>(null);
  const [modalAberta, setModalAberta] = useState(false);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const carregarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }

      console.log('Buscando usuários...');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...filtros,
          nome: searchTerm || undefined
        }
      });

      console.log('Resposta da API:', response.data);
      setUsuarios(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Não foi possível carregar a lista de usuários.');
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [filtros, searchTerm]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = () => {
    carregarUsuarios();
  };

  const limparFiltros = () => {
    setFiltros({
      dataCriacaoInicio: '',
      dataCriacaoFim: '',
      dataNascimentoInicio: '',
      dataNascimentoFim: '',
      minHomenagens: ''
    });
    setSearchTerm('');
    carregarUsuarios();
  };

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.cpf && usuario.cpf.includes(searchTerm))
  );

  const handleVerDetalhes = async (usuario: Usuario) => {
    try {
      setCarregandoDetalhes(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Verifica se o usuário é admin
      const userResponse = await axios.get('/api/users/me', { headers });

      if (!userResponse.data.isAdmin) {
        throw new Error('Acesso não autorizado');
      }

      // Busca detalhes do usuário
      const [usuarioDetalhado, pedidos, homenagens, depoimentos] = await Promise.all([
        axios.get(`/api/users/${usuario._id}`, { headers }),
        axios.get(`/api/pedidos/user/${usuario._id}`, { headers }),
        axios.get(`/api/homenagens/user/${usuario._id}`, { headers }),
        axios.get(`/api/depoimentos/user/${usuario._id}`, { headers })
      ]);

      setUsuarioSelecionado({
        ...usuarioDetalhado.data,
        pedidos: pedidos.data,
        homenagens: homenagens.data,
        depoimentos: depoimentos.data
      });
      setModalAberta(true);
    } catch (err) {
      console.error('Erro ao carregar detalhes do usuário:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar detalhes do usuário');
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout currentPage="usuarios">
        <div className="py-6">
          <div className="px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuários</h1>
            
            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Busca
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nome, email ou CPF"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Criação
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      name="dataCriacaoInicio"
                      value={filtros.dataCriacaoInicio}
                      onChange={handleFiltroChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                    <input
                      type="date"
                      name="dataCriacaoFim"
                      value={filtros.dataCriacaoFim}
                      onChange={handleFiltroChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mínimo de Homenagens
                  </label>
                  <input
                    type="number"
                    name="minHomenagens"
                    value={filtros.minHomenagens}
                    onChange={handleFiltroChange}
                    min="0"
                    placeholder="Ex: 5"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={aplicarFiltros}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
            
            {/* Modal de Detalhes */}
            <UsuarioDetalhesModal
              usuarioSelecionado={usuarioSelecionado}
              modalAberta={modalAberta}
              setModalAberta={setModalAberta}
              carregandoDetalhes={carregandoDetalhes}
            />

            {/* Lista de Usuários */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-lg">
                {usuariosFiltrados.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuário
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CPF
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data de Nascimento
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Homenagens
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Ações</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usuariosFiltrados.map((usuario) => (
                          <tr key={usuario._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <Image
                                    className="h-10 w-10 rounded-full"
                                    src={usuario.foto || '/images/default-avatar.png'}
                                    alt=""
                                    width={40}
                                    height={40}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                                  <div className="text-sm text-gray-500">{usuario.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{usuario.cpf || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {usuario.dataNascimento ? new Date(usuario.dataNascimento).toLocaleDateString() : '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {usuario.quantidadeHomenagens || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                usuario.statusConta === 'ativo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {usuario.statusConta === 'ativo' ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleVerDetalhes(usuario)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Ver detalhes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">Nenhum usuário encontrado com os critérios selecionados</p>
                    <button 
                      onClick={limparFiltros}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default Usuarios;