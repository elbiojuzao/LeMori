import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, Users, Package, CircleDollarSign, 
  Heart, ArrowUpRight, ArrowUpCircle, ArrowDownCircle,
  Calendar, Mail, AlertCircle, Clock
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminRoute from '@/components/AdminRoute';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  usuarios: {
    total: number;
    ativos: number;
    novos: number;
    crescimento: number;
  };
  homenagens: {
    total: number;
    ativas: number;
    novas: number;
    crescimento: number;
  };
  produtos: {
    total: number;
    ativos: number;
  };
  pedidos: {
    total: number;
    novos: number;
    pendentes: number;
    recentes: Array<{
      _id: string;
      userId: {
        _id: string;
        nome: string;
        email: string;
      };
      dataCompra: string;
      valorTotal: number;
      statusPedido: string;
      statusPagamento: string;
      createdAt: string;
    }>;
    crescimento: number;
  };
  faturamento: {
    total: number;
    mes: number;
    recente: number;
    crescimento: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Não foi possível carregar as estatísticas do sistema.');
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout currentPage="dashboard">
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (error || !stats) {
    return (
      <AdminRoute>
        <AdminLayout currentPage="dashboard">
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error || 'Erro ao carregar dados'}
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout currentPage="dashboard">
        <div className="py-6">
          <div className="px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            
            {/* Cards Principais */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Faturamento */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <CircleDollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Faturamento do Mês
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-semibold text-gray-900">
                            R$ {stats.faturamento.mes.toFixed(2)}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stats.faturamento.crescimento >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stats.faturamento.crescimento >= 0 ? (
                              <ArrowUpCircle className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownCircle className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                            )}
                            {Math.abs(stats.faturamento.crescimento).toFixed(1)}%
                          </div>
                        </dd>
                        <dt className="mt-2 text-sm font-medium text-gray-500">
                          Total: R$ {stats.faturamento.total.toFixed(2)}
                        </dt>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/admin/pedidos" className="font-medium text-purple-700 hover:text-purple-900 flex items-center">
                      Ver pedidos
                      <ArrowUpRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pedidos */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                      <Package className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pedidos Pendentes
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-semibold text-gray-900">
                            {stats.pedidos.pendentes}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stats.pedidos.crescimento >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stats.pedidos.crescimento >= 0 ? (
                              <ArrowUpCircle className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownCircle className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                            )}
                            {Math.abs(stats.pedidos.crescimento).toFixed(1)}%
                          </div>
                        </dd>
                        <dt className="mt-2 text-sm font-medium text-gray-500">
                          Total: {stats.pedidos.total}
                        </dt>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/admin/pedidos?status=pendente" className="font-medium text-amber-700 hover:text-amber-900 flex items-center">
                      Ver pendentes
                      <ArrowUpRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Usuários */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Usuários Ativos
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-semibold text-gray-900">
                            {stats.usuarios.ativos}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stats.usuarios.crescimento >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stats.usuarios.crescimento >= 0 ? (
                              <ArrowUpCircle className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownCircle className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                            )}
                            {Math.abs(stats.usuarios.crescimento).toFixed(1)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/admin/usuarios" className="font-medium text-blue-700 hover:text-blue-900 flex items-center">
                      Ver usuários
                      <ArrowUpRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Homenagens */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Homenagens Ativas
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-semibold text-gray-900">
                            {stats.homenagens.ativas}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stats.homenagens.crescimento >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stats.homenagens.crescimento >= 0 ? (
                              <ArrowUpCircle className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownCircle className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                            )}
                            {Math.abs(stats.homenagens.crescimento).toFixed(1)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/admin/homenagens" className="font-medium text-red-700 hover:text-red-900 flex items-center">
                      Ver homenagens
                      <ArrowUpRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Produtos */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                      <Package className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Produtos Ativos
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-semibold text-gray-900">
                            {stats.produtos.ativos}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            de {stats.produtos.total}
                          </span>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/admin/produtos" className="font-medium text-amber-700 hover:text-amber-900 flex items-center">
                      Ver produtos
                      <ArrowUpRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pedidos Recentes */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Pedidos Recentes</h2>
                <Link href="/admin/pedidos" className="text-sm font-medium text-purple-600 hover:text-purple-800">
                  Ver todos
                </Link>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
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
                    {stats.pedidos.recentes.map((pedido) => (
                      <tr key={pedido._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {pedido.userId?.nome || 'Cliente não encontrado'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pedido.userId?.email || 'Email não disponível'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(pedido.dataCompra), "dd 'de' MMMM", { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          R$ {pedido.valorTotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pedido.statusPedido === 'concluido' ? 'bg-green-100 text-green-800' :
                              pedido.statusPedido === 'processando' ? 'bg-yellow-100 text-yellow-800' :
                              pedido.statusPedido === 'cancelado' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {pedido.statusPedido.charAt(0).toUpperCase() + pedido.statusPedido.slice(1)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pedido.statusPagamento === 'aprovado' ? 'bg-green-100 text-green-800' :
                              pedido.statusPagamento === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                              pedido.statusPagamento === 'recusado' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {pedido.statusPagamento.charAt(0).toUpperCase() + pedido.statusPagamento.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/admin/pedidos/${pedido._id}`} className="text-purple-600 hover:text-purple-900">
                            Detalhes
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Estatísticas Detalhadas */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Resumo de Atividades */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo de Atividades</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-100 rounded-md p-2">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Novos Usuários</p>
                        <p className="text-sm text-gray-500">Últimos 7 dias</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{stats.usuarios.novos}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-red-100 rounded-md p-2">
                        <Heart className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Novas Homenagens</p>
                        <p className="text-sm text-gray-500">Últimos 7 dias</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{stats.homenagens.novas}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-md p-2">
                        <CircleDollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Faturamento Recente</p>
                        <p className="text-sm text-gray-500">Últimos 7 dias</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      R$ {stats.faturamento.recente.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-md p-2">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Novos Pedidos</p>
                        <p className="text-sm text-gray-500">Últimos 7 dias</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{stats.pedidos.novos}</p>
                  </div>
                </div>
              </div>

              {/* Taxas de Conversão */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Taxas de Conversão</h2>
                <div className="space-y-6">
                  {/* Taxa de Usuários Ativos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">Usuários Ativos</p>
                      <p className="text-sm font-medium text-gray-900">
                        {((stats.usuarios.ativos / stats.usuarios.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 rounded-full h-2" 
                        style={{ width: `${(stats.usuarios.ativos / stats.usuarios.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Taxa de Homenagens Ativas */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">Homenagens Ativas</p>
                      <p className="text-sm font-medium text-gray-900">
                        {((stats.homenagens.ativas / stats.homenagens.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 rounded-full h-2" 
                        style={{ width: `${(stats.homenagens.ativas / stats.homenagens.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Taxa de Produtos Ativos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">Produtos Ativos</p>
                      <p className="text-sm font-medium text-gray-900">
                        {((stats.produtos.ativos / stats.produtos.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-600 rounded-full h-2" 
                        style={{ width: `${(stats.produtos.ativos / stats.produtos.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default Dashboard;