import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, Edit, Check, X } from 'lucide-react'
import AdminLayout from './AdminLayout'
import AdminRoute from '@/components/AdminRoute'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

interface Cupom {
  _id: string
  codigo: string
  tipoDesconto: 'porcentagem' | 'fixo'
  valor: number
  dataExpiracao?: string
  ativo: boolean
  comissao?: {
    tipo: 'porcentagem' | 'fixo'
    valor: number
  }
}

export default function Cupons() {
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCupom, setEditingCupom] = useState<Cupom | null>(null)
  const [formData, setFormData] = useState({
    codigo: '',
    tipoDesconto: 'porcentagem' as 'porcentagem' | 'fixo',
    valor: '',
    dataExpiracao: '',
    ativo: true,
    comissao: {
      tipo: 'porcentagem' as 'porcentagem' | 'fixo',
      valor: ''
    }
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    carregarCupons()
  }, [])

  const carregarCupons = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/cupons', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao carregar cupons')
      }
      
      const data = await response.json()
      setCupons(data)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar cupons:', error)
      setError('Não foi possível carregar os cupons.')
      setLoading(false)
    }
  }
  
  const handleAddNewClick = () => {
    setFormData({
      codigo: '',
      tipoDesconto: 'porcentagem',
      valor: '',
      dataExpiracao: '',
      ativo: true,
      comissao: {
        tipo: 'porcentagem',
        valor: ''
      }
    })
    setEditingCupom(null)
    setShowForm(true)
  }
  
  const handleEditClick = (cupom: Cupom) => {
    try {
      setFormData({
        codigo: cupom.codigo,
        tipoDesconto: cupom.tipoDesconto,
        valor: cupom.valor.toString(),
        dataExpiracao: cupom.dataExpiracao || '',
        ativo: cupom.ativo,
        comissao: {
          tipo: cupom.comissao?.tipo || 'porcentagem',
          valor: cupom.comissao?.valor?.toString() || ''
        }
      })
      setEditingCupom(cupom)
      setShowForm(true)
    } catch (error) {
      console.error('Erro ao processar dados:', error)
      toast.error('Erro ao carregar dados do cupom')
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      
      const dados = {
        codigo: formData.codigo.toUpperCase(),
        tipoDesconto: formData.tipoDesconto,
        valor: parseFloat(formData.valor) || 0,
        ativo: formData.ativo
      } as Cupom

      // Adiciona dataExpiracao apenas se foi preenchida
      if (formData.dataExpiracao) {
        const dataExpiracao = new Date(formData.dataExpiracao)
        dataExpiracao.setHours(23, 59, 59, 999)
        dados.dataExpiracao = dataExpiracao.toISOString()
      }

      // Adiciona comissao apenas se o valor foi preenchido
      if (formData.comissao.valor) {
        dados.comissao = {
          tipo: formData.comissao.tipo,
          valor: parseFloat(formData.comissao.valor) || 0
        }
      }

      // Validações
      if (!dados.codigo || dados.codigo.length < 3) {
        toast.error('O código deve ter no mínimo 3 caracteres')
        return
      }

      if (!/^[A-Z0-9_-]+$/.test(dados.codigo)) {
        toast.error('O código deve conter apenas letras maiúsculas, números, underline e hífen')
        return
      }

      if (dados.tipoDesconto === 'porcentagem' && (dados.valor <= 0 || dados.valor > 100)) {
        toast.error('Desconto percentual deve estar entre 1 e 100')
        return
      }

      if (dados.tipoDesconto === 'fixo' && dados.valor <= 0) {
        toast.error('Valor do desconto deve ser maior que zero')
        return
      }

      if (dados.comissao?.tipo === 'porcentagem' && (dados.comissao?.valor < 0 || dados.comissao?.valor > 100)) {
        toast.error('Comissão percentual deve estar entre 0 e 100')
        return
      }

      if (dados.comissao?.tipo === 'fixo' && dados.comissao?.valor < 0) {
        toast.error('Valor da comissão não pode ser negativo')
        return
      }

      if (editingCupom) {
        const response = await fetch(`/api/cupons/${editingCupom._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dados)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Erro ao atualizar cupom')
        }

        toast.success('Cupom atualizado com sucesso!')
      } else {
        const response = await fetch('/api/cupons', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dados)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Erro ao criar cupom')
        }

        toast.success('Cupom criado com sucesso!')
      }

      carregarCupons()
      setShowForm(false)
      setEditingCupom(null)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cupom')
    }
  }
  
  const handleDelete = async (cupomId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/cupons/${cupomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir cupom')
      }

      toast.success('Cupom excluído com sucesso!')
      carregarCupons()
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Erro ao excluir cupom:', error)
      toast.error('Erro ao excluir cupom')
    }
  }
  
  const handleToggleActive = async (cupomId: string, ativo: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const cupom = cupons.find(c => c._id === cupomId)
      if (!cupom) return

      const response = await fetch(`/api/cupons/${cupomId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...cupom,
          ativo: !ativo,
          comissao: {
            tipo: cupom.comissao?.tipo || 'porcentagem',
            valor: cupom.comissao?.valor?.toString() || '0'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do cupom')
      }

      toast.success(`Cupom ${ativo ? 'desativado' : 'ativado'} com sucesso!`)
      carregarCupons()
    } catch (error) {
      console.error('Erro ao atualizar status do cupom:', error)
      toast.error('Erro ao atualizar status do cupom')
    }
  }
  
  const isExpired = (dataExpiracao?: string) => {
    if (!dataExpiracao) return false
    return new Date(dataExpiracao) < new Date()
  }
  
  return (
    <AdminRoute>
      <AdminLayout currentPage="cupons">
        <div className="py-6">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Cupons de Desconto</h1>
              
              <button 
                onClick={handleAddNewClick}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-150 flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Adicionar Cupom
              </button>
            </div>
            
            {/* Formulário do Cupom */}
            {showForm && (
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingCupom ? 'Editar Cupom' : 'Adicionar Novo Cupom'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="codigo" className="block text-sm font-medium text-gray-500 mb-1">
                        Código do Cupom
                      </label>
                      <input
                        type="text"
                        id="codigo"
                        name="codigo"
                        required
                        value={formData.codigo}
                        onChange={handleChange}
                        placeholder="ex: VERAO25"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="dataExpiracao" className="block text-sm font-medium text-gray-500 mb-1">
                        Data de Expiração
                      </label>
                      <input
                        type="date"
                        id="dataExpiracao"
                        name="dataExpiracao"
                        value={formData.dataExpiracao}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="tipoDesconto" className="block text-sm font-medium text-gray-500 mb-1">
                        Tipo de Desconto
                      </label>
                      <select
                        id="tipoDesconto"
                        name="tipoDesconto"
                        required
                        value={formData.tipoDesconto}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                      >
                        <option value="porcentagem">Porcentagem</option>
                        <option value="fixo">Valor Fixo</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="valor" className="block text-sm font-medium text-gray-500 mb-1">
                        Valor do Desconto {formData.tipoDesconto === 'porcentagem' ? '(%)' : '(R$)'}
                      </label>
                      <input
                        type="number"
                        id="valor"
                        name="valor"
                        required
                        min="0"
                        max={formData.tipoDesconto === 'porcentagem' ? '100' : undefined}
                        step={formData.tipoDesconto === 'porcentagem' ? '1' : '0.01'}
                        value={formData.valor}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="ativo"
                          name="ativo"
                          checked={formData.ativo}
                          onChange={handleChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="ativo" className="ml-2 block text-sm text-gray-500">
                          Cupom ativo
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Comissão do Afiliado</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="comissaoTipo" className="block text-sm font-medium text-gray-500 mb-1">
                            Tipo de Comissão
                          </label>
                          <select
                            id="comissaoTipo"
                            name="comissao.tipo"
                            value={formData.comissao.tipo}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                          >
                            <option value="porcentagem">Porcentagem</option>
                            <option value="fixo">Valor Fixo</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="comissaoValor" className="block text-sm font-medium text-gray-500 mb-1">
                            Valor da Comissão {formData.comissao.tipo === 'porcentagem' ? '(%)' : '(R$)'}
                          </label>
                          <input
                            type="number"
                            id="comissaoValor"
                            name="comissao.valor"
                            value={formData.comissao.valor}
                            onChange={handleChange}
                            min="0"
                            max={formData.comissao.tipo === 'porcentagem' ? '100' : undefined}
                            step={formData.comissao.tipo === 'porcentagem' ? '1' : '0.01'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingCupom(null)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                    >
                      {editingCupom ? 'Salvar alterações' : 'Adicionar cupom'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de Cupons */}
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            ) : cupons.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Nenhum cupom encontrado</h3>
                <p className="mt-1 text-gray-500">Comece criando um novo cupom de desconto.</p>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Desconto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comissão
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expira em
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cupons.map((cupom) => (
                      <tr key={cupom._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cupom.codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cupom.tipoDesconto === 'porcentagem'
                              ? `${cupom.valor || 0}%`
                              : `R$ ${(cupom.valor || 0).toFixed(2)}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cupom.comissao 
                              ? (cupom.comissao.tipo === 'porcentagem'
                                ? `${cupom.comissao.valor || 0}%`
                                : `R$ ${(cupom.comissao.valor || 0).toFixed(2)}`)
                              : 'Sem comissão'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cupom.dataExpiracao 
                              ? format(new Date(cupom.dataExpiracao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                              : 'Sem data de expiração'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(cupom._id, cupom.ativo)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              cupom.ativo
                                ? cupom.dataExpiracao && isExpired(cupom.dataExpiracao)
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {cupom.ativo
                              ? cupom.dataExpiracao && isExpired(cupom.dataExpiracao)
                                ? 'Expirado'
                                : 'Ativo'
                              : 'Inativo'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditClick(cupom)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Editar cupom"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            {showDeleteConfirm === cupom._id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDelete(cupom._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Confirmar exclusão"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Cancelar"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowDeleteConfirm(cupom._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Excluir cupom"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  )
} 