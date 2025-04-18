import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Head from 'next/head'

interface ProfileFormValues {
  nome: string
  cpf: string
  email: string
  senha: string
}

interface AddressFormValues {
  _id?: string // Adicionado o ID para identificar o endereço em edição
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
  const [activeTab, setActiveTab] = useState('Meu Perfil')
  const [profileForm, setProfileForm] = useState<ProfileFormValues>({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
  })
  const [addresses, setAddresses] = useState<AddressFormValues[]>([])
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [editAddressForm, setEditAddressForm] = useState<AddressFormValues>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  })

  useEffect(() => {
    const fetchUser = async () => {
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
    }

    fetchUser()
  }, [router])

  useEffect(() => {
    const fetchAddresses = async () => {
      if (activeTab === 'Meus Endereços') {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        try {
          const res = await axios.get('/api/users/addresses', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setAddresses(res.data.addresses)
        } catch (error) {
          console.error('Erro ao buscar endereços:', error)
          alert('Erro ao buscar endereços.')
        }
      }
    }

    fetchAddresses()
  }, [activeTab, router])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setEditingAddressId(null) // Limpar o estado de edição ao mudar de aba
    setEditAddressForm({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }) // Limpar o formulário ao mudar de aba
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEditAddress = (address: AddressFormValues) => {
    setEditingAddressId(address._id || null)
    setEditAddressForm({ ...address })
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditAddressForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    if (cep.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        const { logradouro, complemento, bairro, localidade, uf, erro } = response.data
        if (!erro) {
          setEditAddressForm(prev => ({
            ...prev,
            cep,
            rua: logradouro || '',
            complemento: complemento || '',
            bairro: bairro || '',
            cidade: localidade || '',
            estado: uf || '',
          }))
        } else {
          alert('CEP não encontrado.')
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        alert('Erro ao buscar CEP.')
      }
    } else {
      setEditAddressForm(prev => ({ ...prev, cep: e.target.value }))
      if (cep.length < 8) {
        setEditAddressForm(prev => ({ ...prev, rua: '', complemento: '', bairro: '', cidade: '', estado: '' }))
      }
    }
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
      alert('Dados do perfil atualizados com sucesso!')
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      alert('Erro ao atualizar dados do perfil.')
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editingAddressId ? `/api/users/addresses/${editingAddressId}` : '/api/users/addresses'
    const method = editingAddressId ? 'PUT' : 'POST'

    try {
      const res = await axios({
        method,
        url,
        data: editAddressForm,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      alert(`Endereço ${editingAddressId ? 'atualizado' : 'salvo'} com sucesso!`)
      setEditingAddressId(null) // Limpar o estado de edição após salvar
      setEditAddressForm({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }) // Limpar o formulário
      // Recarregar a lista de endereços
      if (activeTab === 'Meus Endereços') {
        const token = localStorage.getItem('token')
        if (token) {
          const res = await axios.get('/api/users/addresses', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setAddresses(res.data.addresses)
        }
      }
    } catch (err) {
      console.error(`Erro ao ${editingAddressId ? 'atualizar' : 'salvar'} endereço:`, err)
      alert(`Erro ao ${editingAddressId ? 'atualizar' : 'salvar'} endereço.`)
    }
  }

  const handleRemoveAddress = async (addressId: string | undefined) => {
    if (!addressId) return

    if (window.confirm('Tem certeza que deseja remover este endereço?')) {
      const token = localStorage.getItem('token')
      try {
        await axios.delete(`/api/users/addresses/${addressId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        alert('Endereço removido com sucesso!')
        // Atualizar a lista de endereços removendo o endereço excluído
        setAddresses(prevAddresses => prevAddresses.filter(addr => addr._id !== addressId))
      } catch (error) {
        console.error('Erro ao remover endereço:', error)
        alert('Erro ao remover endereço.')
      }
    }
  }

  if (loading) return <p className="text-center mt-1 text-gray-400">Carregando dados...</p>

  return (
    <>
      <Head>
        <title>Perfil | LeMori</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-around mb-6">
            <button
              type="button"
              className={`py-2 px-4 rounded-md ${activeTab === 'Meu Perfil' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => handleTabChange('Meu Perfil')}
            >
              Meu Perfil
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-md ${activeTab === 'Meus Endereços' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => handleTabChange('Meus Endereços')}
            >
              Meus Endereços
            </button>
          </div>

          {activeTab === 'Meu Perfil' && (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleProfileSubmit}>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <input type="text" name="nome" value={profileForm.nome} onChange={handleProfileChange} className="mt-1 text-gray-700 p-2 border rounded-md w-full" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">CPF</label>
                <input type="text" name="cpf" value={profileForm.cpf} disabled className="mt-1 text-gray-700 p-2 border rounded-md w-full bg-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Email</label>
                <input type="email" name="email" value={profileForm.email} disabled className="mt-1 text-gray-700 p-2 border rounded-md w-full bg-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Senha</label>
                <input type="password" name="senha" value={profileForm.senha} onChange={handleProfileChange} className="mt-1 text-gray-700 p-2 border rounded-md w-full" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition">
                  Salvar Perfil
                </button>
              </div>
            </form>
          )}

          {activeTab === 'Meus Endereços' && (
            <div>
              {addresses.length > 0 ? (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Meus Endereços:</h3>
                  <ul>
                    {addresses.map(address => (
                      <li key={address._id} className="border p-4 rounded-md shadow-sm mb-2 flex justify-between items-center">
                        <div>
                          <p className="text-gray-700">CEP: {address.cep}</p>
                          <p className="text-gray-700">Rua: {address.rua}, {address.numero} {address.complemento}</p>
                          <p className="text-gray-700">{address.bairro}, {address.cidade} - {address.estado}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md transition"
                            onClick={() => handleEditAddress(address)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition"
                            onClick={() => handleRemoveAddress(address._id)}
                          >
                            Remover
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-700 mb-4">Nenhum endereço cadastrado.</p>
              )}

              <h3 className="text-lg font-semibold text-blue-500 mb-2">{editingAddressId ? 'Editar Endereço' : 'Novo Endereço'}</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddressSubmit}>
                {/* Campos do Meus Endereços */}
                <div>
                  <label className="text-sm font-medium text-gray-600">CEP</label>
                  <input type="text" name="cep" value={editAddressForm.cep} onChange={handleCepChange} className="mt-1 text-gray-700 p-2 border rounded-md w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rua</label>
                  <input type="text" name="rua" value={editAddressForm.rua} readOnly className="mt-1 text-gray-700 p-2 border rounded-md w-full bg-gray-100" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Número</label>
                  <input type="text" name="numero" value={editAddressForm.numero} onChange={handleAddressChange} className="mt-1 text-gray-700 p-2 border rounded-md w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Complemento</label>
                  <input type="text" name="complemento" value={editAddressForm.complemento} onChange={handleAddressChange} className="mt-1 text-gray-700 p-2 border rounded-md w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Bairro</label>
                  <input type="text" name="bairro" value={editAddressForm.bairro} readOnly className="mt-1 text-gray-700 p-2 border rounded-md w-full bg-gray-100" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cidade</label>
                  <input type="text" name="cidade" value={editAddressForm.cidade} readOnly className="mt-1 text-gray-700 p-2 border rounded-md w-full bg-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <input type="text" name="estado" value={editAddressForm.estado} readOnly className="mt-1 text-gray-700 p-2 border rounded-md w-full bg-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition">
                    {editingAddressId ? 'Salvar Alterações do Endereço' : 'Salvar Novo Endereço'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}