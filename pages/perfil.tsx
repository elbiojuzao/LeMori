import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { User, Mail, Check } from 'lucide-react'

interface ProfileFormValues {
  nome: string
  cpf: string
  email: string
  senha: string
}

interface AddressFormValues {
  _id?: string
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

export default function Perfil() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileFormValues>({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
  })
  const [addresses, setAddresses] = useState<AddressFormValues[]>([])

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
      const user = res.data
      setProfileForm({
        nome: user.nome || '',
        cpf: user.cpf || '',
        email: user.email || '',
        senha: '',
      })
      setLoading(false)
    } catch (err) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    fetchUser()
  }, [router, fetchUser])

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
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      alert('Erro ao atualizar dados do perfil.')
    }
  }

  if (loading) return <p className="text-center mt-1 text-gray-400">Carregando dados...</p>

  return (
    <>
      <Header />
      <div className="bg-gray-50 py-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Minha conta</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Perfil</h2>
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
                            className="block text-gray-400 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                            className="block text-gray-400 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                            className="block text-gray-400 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button 
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            // Reset form to current values
                            const token = localStorage.getItem('token')
                            if (token) {
                              fetchUser()
                            }
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
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
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereços</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Gerencie seus endereços de entrega
                </p>
                <button
                  onClick={() => router.push('/enderecos')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  Gerenciar endereços
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Visualize seu histórico de pedidos
                </p>
                <button
                  onClick={() => router.push('/pedidos')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  Ver pedidos
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