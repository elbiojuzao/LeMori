import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { User, Mail, Check, ShoppingBag, Package, MoreVertical, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Menu } from '@headlessui/react'
import Head from 'next/head'
import Image from 'next/image'

interface ProfileFormValues {
  nome: string
  cpf: string
  email: string
  senha: string
}

interface Homenagem {
  _id: string
  nomeHomenageado: string
  dataNascimento: string
  dataFalecimento: string
  fotoPerfil?: string
  createdAt: string
  slug: string
}

interface Pedido {
  _id: string
  createdAt: string
  status: string
  items: Array<{
    quantity: number
    product: {
      name: string
      price: number
    }
  }>
  total: number
}

interface User {
  _id: string;
  nome: string;
  cpf: string;
  email: string;
  isAdmin?: boolean;
  homenagemCreditos?: number;
}

export default function Perfil() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [homenagens, setHomenagens] = useState<Homenagem[]>([])
  const [ultimosPedidos, setUltimosPedidos] = useState<Pedido[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [profileForm, setProfileForm] = useState<ProfileFormValues>({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
  })

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const res = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const userData = res.data
      setUser(userData)
      setProfileForm({
        nome: userData.nome || '',
        cpf: userData.cpf || '',
        email: userData.email || '',
        senha: '',
      })

      // Buscar homenagens do usuário
      const resHomenagens = await axios.get(`/api/homenagens/user/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setHomenagens(resHomenagens.data)
      
      setLoading(false)
    } catch {
      router.push('/login')
    }
  }, [router])

  const fetchPedidos = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await axios.get('/api/pedidos/user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Pegar os 3 últimos pedidos
      setUltimosPedidos(response.data.slice(0, 3))
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
    }
  }, [])

  useEffect(() => {
    fetchUser()
    fetchPedidos()
  }, [router, fetchUser, fetchPedidos])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      await axios.put('/api/users/profile', profileForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setIsEditing(false)
      setShowSuccessMessage(true)
      
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch {
      alert('Erro ao atualizar dados do perfil.')
    }
  }

  const formatarData = (data: string | undefined) => {
    if (!data) return "Data não disponível"
    try {
      return format(new Date(data), "dd/MM/yyyy")
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return "Data não disponível"
    }
  }

  if (loading) return <p className="text-center mt-1 text-gray-400">Carregando dados...</p>

  return (
    <>
      <Head>
        <title>Meu Perfil | Lemori</title>
        <meta name="description" content="Gerencie suas homenagens e informações pessoais" />
      </Head>
      <Header />
      <div className="bg-gray-50 py-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Minha conta</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Perfil</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                  )}
                </div>
                
                {showSuccessMessage && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                    <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Perfil atualizado com sucesso!</span>
                  </div>
                )}
                
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome completo
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-gray-400" />
                          </div>
                          <input
                            id="nome"
                            name="nome"
                            type="text"
                            value={profileForm.nome}
                            onChange={handleProfileChange}
                            className="block text-gray-600 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            className="block text-gray-600 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                          CPF
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-gray-400" />
                          </div>
                          <input
                            id="cpf"
                            name="cpf"
                            type="text"
                            value={profileForm.cpf}
                            onChange={handleProfileChange}
                            className="block text-gray-600 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <button 
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            const token = localStorage.getItem('token')
                            if (token) {
                              fetchUser()
                            }
                          }}
                          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                        >
                          Salvar alterações
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Nome completo</div>
                      <div className="text-gray-900">{profileForm.nome}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                      <div className="text-gray-900">{profileForm.email}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">CPF</div>
                      <div className="text-gray-900">{profileForm.cpf}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Homenagens Section */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Pessoas Homenageadas</h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="text-sm text-gray-600">
                      Créditos disponíveis: <span className="font-semibold text-purple-600">{user?.homenagemCreditos || 0}</span>
                    </div>
                    {user?.homenagemCreditos && user.homenagemCreditos > 0 ? (
                      <button
                        onClick={() => router.push('/homenagem/form')}
                        className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        Criar Nova Homenagem
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/shop')}
                        className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        Comprar Créditos
                      </button>
                    )}
                  </div>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {homenagens.length > 0 ? (
                    homenagens.map((homenagem) => (
                      <li key={homenagem._id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            {homenagem.fotoPerfil ? (
                              <Image
                                src={homenagem.fotoPerfil}
                                alt={`Foto de ${homenagem.nomeHomenageado}`}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-lg text-purple-600">
                                  {homenagem.nomeHomenageado.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{homenagem.nomeHomenageado}</p>
                            <p className="text-xs text-gray-500">
                              Homenageada em {formatarData(homenagem.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/homenagem/${homenagem._id}`}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            Ver homenagem
                          </Link>
                          <Menu as="div" className="relative">
                            <Menu.Button className="p-1 hover:bg-gray-100 rounded-full">
                              <MoreVertical className="h-5 w-5 text-gray-500" />
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-100">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href="/planos"
                                    className={`flex items-center px-4 py-2 text-sm ${
                                      active ? 'bg-purple-50 text-purple-600' : 'text-gray-700'
                                    }`}
                                  >
                                    <CreditCard className="h-4 w-4 mr-3" />
                                    Comprar plano
                                  </Link>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Menu>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 text-gray-500 text-center">
                      Nenhuma homenagem encontrada
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-4 lg:space-y-6">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereços</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Gerencie seus endereços de entrega
                </p>
                <button
                  onClick={() => router.push('/endereco')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  Gerenciar endereços
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Recentes</h3>
                {ultimosPedidos.length > 0 ? (
                  <div className="space-y-4 mb-4">
                    {ultimosPedidos.map(pedido => {
                      const totalItens = pedido.items.reduce((sum, item) => sum + item.quantity, 0)
                      return (
                        <div key={pedido._id} className="border-b border-gray-200 pb-4 last:border-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                              <ShoppingBag className="h-5 w-5 text-purple-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {format(new Date(pedido.createdAt), "dd/MM/yyyy")}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                              <Package className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Status: {pedido.status}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-purple-600">
                              R$ {pedido.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">
                    Nenhum pedido realizado ainda.
                  </p>
                )}
                <button
                  onClick={() => router.push('/pedidos')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  Ver histórico de compras
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}