import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  MapPinIcon
} from '@heroicons/react/24/solid'

interface Endereco {
  _id: string
  cep: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  userId: string
}

interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export default function Endereco() {
  const router = useRouter()
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCep, setLoadingCep] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<Endereco, '_id' | 'userId'>>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  })

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  useEffect(() => {
    fetchEnderecos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchEnderecos = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await axios.get('/api/users/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEnderecos(response.data.addresses)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar endereços:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      if (editingId) {
        await axios.put(`/api/users/addresses/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/users/addresses', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      fetchEnderecos()
      setShowForm(false)
      setEditingId(null)
      setFormData({
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar endereço';
      console.error('Erro ao salvar endereço:', errorMessage)
      if (typeof error === 'object' && error && 'response' in error && (error as { response?: { data?: { error?: string } } }).response?.data?.error) {
        alert((error as { response?: { data?: { error?: string } } }).response?.data?.error)
      } else {
        alert('Erro ao salvar endereço')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await axios.delete(`/api/users/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchEnderecos()
    } catch (error) {
      console.error('Erro ao excluir endereço:', error)
      alert('Erro ao excluir endereço')
    }
  }

  const handleEdit = (endereco: Endereco) => {
    setFormData({
      cep: endereco.cep,
      rua: endereco.rua,
      numero: endereco.numero,
      complemento: endereco.complemento || '',
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado
    })
    setEditingId(endereco._id)
    setShowForm(true)
  }

  const buscarCep = async (cep: string) => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) {
      return
    }

    setLoadingCep(true)
    try {
      const response = await axios.get<ViaCEPResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = response.data

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          cep: cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2'),
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
          complemento: data.complemento || prev.complemento
        }))
      } else {
        alert('CEP não encontrado')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      alert('Erro ao buscar CEP')
    } finally {
      setLoadingCep(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Formata o CEP enquanto digita
    const cepFormatado = value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d{3})/, '$1-$2')
      .substr(0, 9)

    setFormData(prev => ({ ...prev, cep: cepFormatado }))

    if (value.replace(/\D/g, '').length === 8) {
      buscarCep(value)
    }
  }

  if (loading) {
    return <p className="text-center mt-8">Carregando endereços...</p>
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button 
              onClick={() => router.push('/perfil')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Voltar para perfil
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">Meus Endereços</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Endereços salvos</h2>
              
              {enderecos.length < 3 && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Adicionar novo endereço
                </button>
              )}
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full p-2 border rounded-md text-gray-600"
                        required
                      />
                      {loadingCep && (
                        <div className="absolute right-2 top-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                    <input
                      type="text"
                      value={formData.rua}
                      onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                      className="w-full p-2 border rounded-md text-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      className="w-full p-2 border rounded-md text-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      className="w-full p-2 border rounded-md text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      className="w-full p-2 border rounded-md text-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="w-full p-2 border rounded-md text-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full p-2 border rounded-md text-gray-600"
                      required
                    >
                      <option value="">Selecione um estado</option>
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      setFormData({
                        cep: '',
                        rua: '',
                        numero: '',
                        complemento: '',
                        bairro: '',
                        cidade: '',
                        estado: ''
                      })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                  >
                    {editingId ? 'Salvar alterações' : 'Adicionar endereço'}
                  </button>
                </div>
              </form>
            )}

            {enderecos.length > 0 ? (
              <div className="space-y-4">
                {enderecos.map((endereco) => (
                  <div key={endereco._id} className="border border-gray-200 rounded-lg p-4 relative">
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => handleEdit(endereco)}
                        className="text-gray-500 hover:text-blue-600 p-1"
                        title="Editar endereço"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(endereco._id)}
                        className="text-gray-500 hover:text-red-600 p-1"
                        title="Excluir endereço"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-2 rounded-full bg-purple-100 mr-4">
                        <MapPinIcon className="h-5 w-5 text-purple-600" />
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-900">
                            {endereco.rua}, {endereco.numero}
                          </h3>
                        </div>

                        <div className="text-sm text-gray-500">
                          {endereco.complemento && <p>{endereco.complemento}</p>}
                          <p>{endereco.bairro}</p>
                          <p>{endereco.cidade}, {endereco.estado} - {endereco.cep}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 rounded-full p-3">
                    <MapPinIcon className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-gray-500">Nenhum endereço cadastrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
} 