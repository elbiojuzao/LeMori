import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Calendar,
  MapPin,
  Truck,
  Receipt,
  ArrowLeft
} from 'lucide-react'

interface Pedido {
  _id: string
  createdAt: string
  status: string
  items: Array<{
    quantity: number
    product: {
      name: string
      price: number
      imageSrc?: string
    }
  }>
  total: number
  endereco: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  pagamento: {
    metodo: string
    status: string
  }
  rastreio?: {
    codigo: string
    status: string
    atualizadoEm: string
  }
}

async function fetchPedidos(token: string) {
  const response = await axios.get('/api/pedidos/user', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export default function Pedidos() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [ordenacao, setOrdenacao] = useState<'recentes' | 'antigos'>('recentes')

  const carregarPedidos = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const data = await fetchPedidos(token)
      setPedidos(data)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      setError('Não foi possível carregar seus pedidos. Tente novamente mais tarde.')
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    carregarPedidos()
  }, [carregarPedidos])

  const solicitarReembolso = async (pedidoId: string) => {
    if (!confirm('Tem certeza que deseja solicitar reembolso deste pedido?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/pedidos/${pedidoId}/reembolso`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Atualiza a lista de pedidos
      carregarPedidos()
      alert('Solicitação de reembolso enviada com sucesso!')
    } catch (error) {
      console.error('Erro ao solicitar reembolso:', error)
      alert('Erro ao solicitar reembolso. Tente novamente.')
    }
  }

  const formatarStatus = (status: string) => {
    const statusMap: { [key: string]: { texto: string; cor: string } } = {
      'pendente': { texto: 'Aguardando pagamento', cor: 'text-yellow-600 bg-yellow-50' },
      'pago': { texto: 'Pagamento confirmado', cor: 'text-green-600 bg-green-50' },
      'preparando': { texto: 'Preparando pedido', cor: 'text-blue-600 bg-blue-50' },
      'enviado': { texto: 'Enviado', cor: 'text-purple-600 bg-purple-50' },
      'entregue': { texto: 'Entregue', cor: 'text-gray-600 bg-gray-50' },
      'cancelado': { texto: 'Cancelado', cor: 'text-red-600 bg-red-50' },
      'reembolso_solicitado': { texto: 'Reembolso solicitado', cor: 'text-orange-600 bg-orange-50' },
      'reembolsado': { texto: 'Reembolsado', cor: 'text-green-600 bg-green-50' }
    }

    return statusMap[status] || { texto: status, cor: 'text-gray-600 bg-gray-50' }
  }

  const pedidosFiltrados = pedidos
    .filter(pedido => filtroStatus === 'todos' || pedido.status === filtroStatus)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return ordenacao === 'recentes' ? dateB - dateA : dateA - dateB
    })

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/perfil')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar para perfil
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Histórico de Compras</h1>
            </div>
            <div className="flex space-x-4">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="todos">Todos os status</option>
                <option value="pendente">Aguardando pagamento</option>
                <option value="pago">Pagamento confirmado</option>
                <option value="preparando">Preparando pedido</option>
                <option value="enviado">Enviado</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
                <option value="reembolso_solicitado">Reembolso solicitado</option>
                <option value="reembolsado">Reembolsado</option>
              </select>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as 'recentes' | 'antigos')}
                className="rounded-md border border-gray-300 px-3 py-2 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="recentes">Mais recentes primeiro</option>
                <option value="antigos">Mais antigos primeiro</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-500 mb-4">Você ainda não realizou nenhuma compra.</p>
              <button
                onClick={() => router.push('/shop')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                Ir para loja
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {pedidosFiltrados.map((pedido) => (
                <div key={pedido._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Cabeçalho do Pedido */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Receipt className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Pedido:</span>
                          <span className="font-medium text-gray-900">#{pedido._id.slice(-6)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {format(new Date(pedido.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${formatarStatus(pedido.status).cor}`}>
                        {formatarStatus(pedido.status).texto}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {pedido.items.reduce((sum, item) => sum + item.quantity, 0)} itens
                        </span>
                      </div>
                      <div className="text-lg font-bold text-purple-600">
                        R$ {pedido.total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes do Pedido (Expansível) */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() => setPedidoExpandido(pedidoExpandido === pedido._id ? null : pedido._id)}
                      className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-purple-600">
                        {pedidoExpandido === pedido._id ? 'Ocultar detalhes' : 'Ver detalhes'}
                      </span>
                      {pedidoExpandido === pedido._id ? (
                        <ChevronUp className="h-5 w-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-purple-600" />
                      )}
                    </button>
                  </div>

                  {pedidoExpandido === pedido._id && (
                    <div className="p-6 space-y-6">
                      {/* Lista de Produtos */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Produtos</h4>
                        <div className="space-y-4">
                          {pedido.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              {item.product.imageSrc ? (
                                <Image
                                  src={item.product.imageSrc}
                                  alt={item.product.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 rounded-md object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                                  <ShoppingBag className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h5 className="text-sm font-medium text-gray-900">{item.product.name}</h5>
                                <p className="text-sm text-gray-500">
                                  Quantidade: {item.quantity} x R$ {item.product.price.toFixed(2)}
                                </p>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                R$ {(item.quantity * item.product.price).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Endereço de Entrega */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Endereço de Entrega</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                            <div>
                              <p className="text-sm text-gray-900">
                                {pedido.endereco.rua}, {pedido.endereco.numero}
                                {pedido.endereco.complemento && ` - ${pedido.endereco.complemento}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {pedido.endereco.bairro}
                              </p>
                              <p className="text-sm text-gray-500">
                                {pedido.endereco.cidade} - {pedido.endereco.estado}
                              </p>
                              <p className="text-sm text-gray-500">
                                CEP: {pedido.endereco.cep}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Informações de Rastreio */}
                      {pedido.rastreio && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Rastreamento</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <Truck className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-sm text-gray-900">
                                  Código de rastreio: {pedido.rastreio.codigo}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Status: {pedido.rastreio.status}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Última atualização: {format(new Date(pedido.rastreio.atualizadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ações do Pedido */}
                      <div className="flex justify-end space-x-4">
                        {['entregue', 'enviado'].includes(pedido.status) && (
                          <button
                            onClick={() => solicitarReembolso(pedido._id)}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-md text-sm font-medium hover:bg-red-50"
                          >
                            Solicitar reembolso
                          </button>
                        )}
                        {pedido.status === 'enviado' && pedido.rastreio && (
                          <a
                            href={`https://www.correios.com.br/rastreamento/${pedido.rastreio.codigo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                          >
                            Rastrear pedido
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
} 