import { useState, useEffect, useCallback } from 'react'
import { Search, Calendar } from 'lucide-react'
import AdminLayout from '@/pages/admin/AdminLayout'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import Image from 'next/image'

interface Usuario {
  _id: string
  nome: string
  foto?: string
}

interface DepoimentoCompleto {
  _id: string
  depoimento: string
  status: 'aprovado' | 'pendente' | 'rejeitado'
  dataCriacao: string
  usuario: Usuario
}

interface Filtros {
  busca: string
  status: 'todos' | 'aprovado' | 'pendente' | 'rejeitado'
  dataInicio?: string
  dataFim?: string
}

export default function AdminDepoimentos() {
  const [depoimentos, setDepoimentos] = useState<DepoimentoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    status: 'todos'
  })

  const carregarDepoimentos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      
      if (filtros.busca) params.append('busca', filtros.busca)
      if (filtros.status !== 'todos') params.append('status', filtros.status)
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio)
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim)

      const response = await axios.get<DepoimentoCompleto[]>(`/api/depoimentos/todos?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setDepoimentos(response.data)
    } catch (err) {
      setError('Erro ao carregar depoimentos')
      console.error('Erro ao carregar depoimentos:', err)
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => {
    carregarDepoimentos()
  }, [carregarDepoimentos])

  const handleAprovar = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/depoimentos/${id}/aprovar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setDepoimentos(depoimentos.map(d => 
        d._id === id ? { ...d, status: 'aprovado' } : d
      ))
      toast.success('Depoimento aprovado com sucesso!')
    } catch (err) {
      console.error('Erro ao aprovar depoimento:', err)
      toast.error('Erro ao aprovar depoimento')
    }
  }

  const handleRejeitar = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/depoimentos/${id}/rejeitar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setDepoimentos(depoimentos.filter(d => d._id !== id))
      toast.success('Depoimento rejeitado com sucesso!')
    } catch (err) {
      console.error('Erro ao rejeitar depoimento:', err)
      toast.error('Erro ao rejeitar depoimento')
    }
  }

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function abreviarNome(nome: string) {
    if (!nome) return '';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0];
    return `${partes[0]} ${partes[partes.length - 1][0]}.`;
  }

  if (loading) {
    return (
      <AdminLayout currentPage="depoimentos">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout currentPage="depoimentos">
        <div className="text-red-500 text-center mt-8">{error}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="depoimentos">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Gerenciar Depoimentos</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                name="busca"
                value={filtros.busca}
                onChange={handleFiltroChange}
                placeholder="Buscar por usuário ou depoimento..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <select
              name="status"
              value={filtros.status}
              onChange={handleFiltroChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="aprovado">Aprovados</option>
              <option value="pendente">Pendentes</option>
              <option value="rejeitado">Rejeitados</option>
            </select>

            <div className="relative">
              <input
                type="date"
                name="dataInicio"
                value={filtros.dataInicio || ''}
                onChange={handleFiltroChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <input
                type="date"
                name="dataFim"
                value={filtros.dataFim || ''}
                onChange={handleFiltroChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depoimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {depoimentos.map((depoimento) => (
                <tr key={depoimento._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {depoimento.usuario?.foto ? (
                          <Image
                            src={depoimento.usuario.foto}
                            alt={depoimento.usuario.nome}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm font-medium">
                              {depoimento.usuario?.nome?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {abreviarNome(depoimento.usuario?.nome) || 'Usuário não encontrado'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800 max-w-md truncate">
                      {depoimento.depoimento}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800">
                      {depoimento.dataCriacao
                        ? format(new Date(depoimento.dataCriacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      depoimento.status === 'aprovado'
                        ? 'bg-green-100 text-green-900'
                        : depoimento.status === 'pendente'
                          ? 'bg-yellow-100 text-yellow-900'
                          : 'bg-red-100 text-red-900'
                    }`}>
                      {depoimento.status === 'aprovado'
                        ? 'Aprovado'
                        : depoimento.status === 'pendente'
                          ? 'Pendente'
                          : 'Rejeitado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {depoimento.status === 'pendente' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAprovar(depoimento._id)}
                          className="text-green-700 hover:text-green-900 font-medium"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleRejeitar(depoimento._id)}
                          className="text-red-700 hover:text-red-900 font-medium"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
} 