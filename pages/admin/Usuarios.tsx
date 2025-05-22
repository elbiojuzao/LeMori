import React, { useState, useEffect } from 'react';
import { Search, Mail, User, AlertCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminRoute from '@/components/AdminRoute';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...filtros,
          nome: searchTerm || undefined
        }
      });

      setUsuarios(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Não foi possível carregar a lista de usuários.');
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

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
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Homenagens
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cadastro
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usuariosFiltrados.map((usuario) => (
                          <tr key={usuario._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <User className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                                  <div className="text-sm text-gray-500">{usuario.cpf || 'CPF não informado'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail size={14} className="mr-1 text-gray-400" />
                                {usuario.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                usuario.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {usuario.isAdmin ? 'Admin' : 'Cliente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {usuario.quantidadeHomenagens}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                usuario.statusConta === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {usuario.statusConta === 'ativo' ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail size={14} className="mr-1 text-gray-400" />
                                {usuario.createdAt 
                                  ? format(new Date(usuario.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                  : 'Data não registrada'}
                              </div>
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