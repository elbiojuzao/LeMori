import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import UsuarioDetalhesModal from '@/components/UsuarioDetalhesModal';

interface Item {
  _id: string;
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
  tipoItem: 'fisico' | 'homenagem';
}

interface Pedido {
  _id: string;
  userId: {
    _id: string;
    nome: string;
    email: string;
  };
  dataCompra: string;
  statusPagamento: 'pendente' | 'aprovado' | 'cancelado';
  statusPedido: 'pendente' | 'processando' | 'enviado' | 'entregue';
  valorTotal: number;
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  items: Item[];
  idTransacao: string;
}

interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

interface UsuarioDetalhado {
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
  pedidos?: any[];
  homenagens?: any[];
  depoimentos?: any[];
}

const Orders: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('dataCompra');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioDetalhado | null>(null);
  const [modalAberta, setModalAberta] = useState(false);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get('/api/admin/pedidos', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchTerm || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy,
          sortOrder
        }
      });

      setPedidos(response.data.pedidos);
      setPagination(response.data.pagination);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setError('Erro ao carregar pedidos. Tente novamente.');
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [pagination.currentPage, filterStatus, searchTerm, startDate, endDate, sortBy, sortOrder]);

  const handleStatusChange = async (orderId: string, newStatus: 'pendente' | 'processando' | 'enviado' | 'entregue') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.patch(`/api/admin/pedidos/${orderId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Status atualizado com sucesso');
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleOpenUserModal = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUserId(null);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleVerDetalhesUsuario = async (userId: string) => {
    try {
      setCarregandoDetalhes(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [usuarioDetalhado, pedidos, homenagens, depoimentos] = await Promise.all([
        axios.get(`/api/users/${userId}`, { headers }),
        axios.get(`/api/pedidos/user/${userId}`, { headers }),
        axios.get(`/api/homenagens/user/${userId}`, { headers }),
        axios.get(`/api/depoimentos/user/${userId}`, { headers })
      ]);
      setUsuarioSelecionado({
        ...usuarioDetalhado.data,
        pedidos: pedidos.data,
        homenagens: homenagens.data,
        depoimentos: depoimentos.data
      });
      setModalAberta(true);
    } catch (err) {
      toast.error('Erro ao carregar detalhes do usuário');
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  return (
    <AdminLayout currentPage="orders">
      {showUserModal && selectedUserId && (
        <UsuarioDetalhesModal
          usuarioSelecionado={usuarioSelecionado}
          modalAberta={modalAberta}
          setModalAberta={setModalAberta}
          carregandoDetalhes={carregandoDetalhes}
        />
      )}
      <div className="py-6">
        <div className="px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>
          
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por ID, CEP, cliente ou e-mail"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
            </div>
            
            <div className="flex items-center">
              <Filter size={18} className="text-gray-500 mr-2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="processando">Processando</option>
                <option value="enviado">Enviado</option>
                <option value="entregue">Entregue</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-700 text-sm">De:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-gray-900"
              />
              <label className="text-gray-700 text-sm">Até:</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-gray-900"
              />
            </div>
          </div>
          
          {/* Orders Table */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={fetchPedidos}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : pedidos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        onClick={() => handleSort('idTransacao')}
                        className="cursor-pointer select-none px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID do Pedido
                        {sortBy === 'idTransacao' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                      <th
                        onClick={() => handleSort('dataCompra')}
                        className="cursor-pointer select-none px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Data
                        {sortBy === 'dataCompra' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                      <th
                        onClick={() => handleSort('userId.nome')}
                        className="cursor-pointer select-none px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Cliente
                        {sortBy === 'userId.nome' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                      <th
                        onClick={() => handleSort('valorTotal')}
                        className="cursor-pointer select-none px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                        {sortBy === 'valorTotal' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                      <th
                        onClick={() => handleSort('statusPedido')}
                        className="cursor-pointer select-none px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                        {sortBy === 'statusPedido' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pedidos.map((pedido) => (
                      <React.Fragment key={pedido._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pedido.idTransacao}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(pedido.dataCompra).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pedido.userId?.nome ? (
                              <button
                                className="text-purple-700 hover:underline font-medium focus:outline-none"
                                onClick={() => handleVerDetalhesUsuario(pedido.userId._id)}
                                title="Ver dados do usuário"
                              >
                                {pedido.userId.nome}
                              </button>
                            ) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            R$ {pedido.valorTotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pedido.statusPedido === 'entregue' ? 'bg-green-100 text-green-800' :
                              pedido.statusPedido === 'enviado' ? 'bg-blue-100 text-blue-800' :
                              pedido.statusPedido === 'processando' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {pedido.statusPedido.charAt(0).toUpperCase() + pedido.statusPedido.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => toggleOrderDetails(pedido._id)}
                              className="text-purple-600 hover:text-purple-900 inline-flex items-center"
                            >
                              Detalhes
                              <ChevronDown size={14} className={`ml-1 transform ${expandedOrderId === pedido._id ? 'rotate-180' : ''}`} />
                            </button>
                          </td>
                        </tr>
                        
                        {expandedOrderId === pedido._id && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="sm:grid sm:grid-cols-2 sm:gap-8">
                                {/* Order Details */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">ITENS DO PEDIDO</h4>
                                  <ul className="space-y-2 mb-4">
                                    {pedido.items.map((item) => (
                                      <li key={item._id} className="flex justify-between text-sm">
                                        <span className="text-gray-800">
                                          {item.quantidade} x {item.nomeProduto}
                                        </span>
                                        <span className="text-gray-600">
                                          R$ {(item.valorUnitario * item.quantidade).toFixed(2)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                  
                                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                                    <span className="text-sm font-medium text-gray-900">Total</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      R$ {pedido.valorTotal.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Shipping & Status */}
                                <div>
                                  {pedido.endereco && (
                                    <>
                                      <h4 className="text-sm font-medium text-gray-500 mb-2">ENDEREÇO DE ENTREGA</h4>
                                      <address className="not-italic text-sm text-gray-700 mb-4">
                                        <p>{pedido.endereco.rua}, {pedido.endereco.numero}</p>
                                        {pedido.endereco.complemento && <p>{pedido.endereco.complemento}</p>}
                                        <p>{pedido.endereco.bairro}</p>
                                        <p>{pedido.endereco.cidade}, {pedido.endereco.estado} {pedido.endereco.cep}</p>
                                      </address>
                                    </>
                                  )}
                                  
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">ATUALIZAR STATUS</h4>
                                  <div className="flex gap-2 mt-2">
                                    {['pendente', 'processando', 'enviado', 'entregue'].map((status) => (
                                      <button
                                        key={status}
                                        onClick={() => status !== pedido.statusPedido && handleStatusChange(pedido._id, status as any)}
                                        className={
                                          `px-3 py-1 rounded-full text-xs font-medium transition-colors ` +
                                          (pedido.statusPedido === status
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                                        }
                                        disabled={pedido.statusPedido === status}
                                        style={{ cursor: pedido.statusPedido === status ? 'default' : 'pointer' }}
                                      >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={pagination.currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={pagination.currentPage === pagination.pages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Próximo
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> até{' '}
                          <span className="font-medium">
                            {Math.min(pagination.currentPage * pagination.limit, pagination.total)}
                          </span>{' '}
                          de <span className="font-medium">{pagination.total}</span> resultados
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                            disabled={pagination.currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            Anterior
                          </button>
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.currentPage
                                  ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                            disabled={pagination.currentPage === pagination.pages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            Próximo
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Nenhum pedido encontrado</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {usuarioSelecionado && (
        <UsuarioDetalhesModal
          usuarioSelecionado={usuarioSelecionado}
          modalAberta={modalAberta}
          setModalAberta={setModalAberta}
          carregandoDetalhes={carregandoDetalhes}
        />
      )}
    </AdminLayout>
  );
};

export default Orders;