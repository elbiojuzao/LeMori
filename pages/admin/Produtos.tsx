import { Plus, Trash2, Edit, Check, X, Search } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminRoute from '@/components/AdminRoute';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';

interface Produto {
  _id: string
  nome: string
  descricao: string
  valor: number
  destaque: boolean
  createdAt: string
  updatedAt: string
}

const Produtos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor: ''
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }

      const response = await fetch('/api/admin/produtos', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        throw new Error('Você não tem permissão para acessar esta área.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar produtos');
      }
      
      const data = await response.json();
      setProdutos(data);
      setLoading(false);
    } catch (error: unknown) {
      console.error('Erro ao carregar produtos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar produtos';
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
      
      if (errorMessage.includes('login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };
  
  const handleAddNewClick = () => {
    setFormData({
      nome: '',
      descricao: '',
      valor: ''
    });
    setEditingProduto(null);
    setShowForm(true);
  };
  
  const handleEditClick = (produto: Produto) => {
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      valor: produto.valor.toString()
    });
    setEditingProduto(produto);
    setShowForm(true);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const dados = {
        nome: formData.nome,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor)
      };

      // Validações
      if (!dados.nome || dados.nome.length < 3) {
        toast.error('O nome deve ter no mínimo 3 caracteres');
        return;
      }

      if (!dados.descricao || dados.descricao.length < 10) {
        toast.error('A descrição deve ter no mínimo 10 caracteres');
        return;
      }

      if (dados.valor <= 0) {
        toast.error('O valor deve ser maior que zero');
        return;
      }

      if (editingProduto) {
        const response = await fetch(`/api/admin/produtos/${editingProduto._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dados)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao atualizar produto');
        }

        toast.success('Produto atualizado com sucesso!');
      } else {
        const response = await fetch('/api/admin/produtos', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dados)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao criar produto');
        }

        toast.success('Produto criado com sucesso!');
      }

      carregarProdutos();
      setShowForm(false);
      setEditingProduto(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar produto';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (produtoId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/produtos/${produtoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir produto');
      }

      toast.success('Produto excluído com sucesso!');
      carregarProdutos();
      setShowDeleteConfirm(null);
    } catch (error: unknown) {
      console.error('Erro ao excluir produto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir produto';
      toast.error(errorMessage);
    }
  };

  const handleToggleDestaque = async (produtoId: string, destaqueAtual: boolean) => {
    try {
      const token = localStorage.getItem('token');
      
      // Log para debug
      console.log('Alterando destaque do produto:', produtoId, 'de', destaqueAtual, 'para', !destaqueAtual);
      
      const response = await fetch(`/api/admin/produtos/${produtoId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ destaque: !destaqueAtual })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar destaque do produto');
      }

      const produtoAtualizado = await response.json();
      console.log('Resposta da API:', produtoAtualizado);

      // Atualiza o estado local imediatamente
      setProdutos(produtos.map(produto => 
        produto._id === produtoId 
          ? { ...produto, destaque: !destaqueAtual }
          : produto
      ));

      toast.success('Destaque atualizado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao atualizar destaque:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar destaque do produto';
      toast.error(errorMessage);
      
      // Reverte o estado local em caso de erro
      setProdutos(produtos.map(produto => 
        produto._id === produtoId 
          ? { ...produto, destaque: destaqueAtual }
          : produto
      ));
    }
  };

  const filteredProdutos = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminRoute>
      <AdminLayout currentPage="produtos">
        <div className="py-6">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
              
              <button 
                onClick={handleAddNewClick}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-150 flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Adicionar Produto
              </button>
            </div>
            
            {/* Formulário do Produto */}
            {showForm && (
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingProduto ? 'Editar Produto' : 'Adicionar Novo Produto'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-medium text-gray-500 mb-1">
                        Nome do Produto
                      </label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        required
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="descricao" className="block text-sm font-medium text-gray-500 mb-1">
                        Descrição
                      </label>
                      <textarea
                        id="descricao"
                        name="descricao"
                        required
                        value={formData.descricao}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="valor" className="block text-sm font-medium text-gray-500 mb-1">
                        Valor (R$)
                      </label>
                      <input
                        type="number"
                        id="valor"
                        name="valor"
                        required
                        min="0"
                        step="0.01"
                        value={formData.valor}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingProduto(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                    >
                      {editingProduto ? 'Salvar alterações' : 'Adicionar produto'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Barra de Busca */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou descrição"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-500"
                />
              </div>
            </div>

            {/* Lista de Produtos */}
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
                <p className="mt-1 text-gray-500">Comece adicionando um novo produto.</p>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Criação
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destaque
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProdutos.map((produto) => (
                      <tr key={produto._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                              <div className="text-sm text-gray-500">{produto.descricao.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            R$ {(produto.valor || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(produto.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleDestaque(produto._id, produto.destaque)}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                              produto.destaque ? 'bg-purple-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className="sr-only">Toggle destaque</span>
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                produto.destaque ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleEditClick(produto)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Editar produto"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            {showDeleteConfirm === produto._id ? (
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleDelete(produto._id)}
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
                                onClick={() => setShowDeleteConfirm(produto._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Excluir produto"
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
  );
};

export default Produtos;