import { Plus, Trash2, Edit, Check, X, Search, Upload } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminRoute from '@/components/AdminRoute';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Produto {
  _id: string
  nome: string
  descricao: string
  preco: number
  precoPromocional?: number
  promocaoAtiva: boolean
  inicioPromocao?: Date
  fimPromocao?: Date
  destaque: boolean
  ativo: boolean
  estoque: number
  categoria: string
  isFisico: boolean
  largura?: number
  altura?: number
  comprimento?: number
  peso?: number
  imagens: string[]
  createdAt: string
  updatedAt: string
}

const formatarPreco = (valor: string): string => {
  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, '');
  
  // Converte para número
  const preco = Number(numeros);
  
  // Verifica se o número é inteiro
  if (Number.isInteger(preco)) {
    return preco.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
  
  // Se não for inteiro, divide por 100 para considerar os centavos
  const precoComDecimais = preco / 100;
  
  // Formata o número com 2 casas decimais
  return precoComDecimais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const desformatarPreco = (valor: string): string => {
  // Remove o R$ e converte vírgula para ponto
  const valorLimpo = valor.replace('R$ ', '').replace('.', '').replace(',', '.');
  
  // Verifica se o valor é um número inteiro
  const numero = Number(valorLimpo);
  if (Number.isInteger(numero)) {
    return numero.toString();
  }
  
  // Se não for inteiro, multiplica por 100 para manter os centavos
  return (numero * 100).toString();
};

const Produtos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    precoPromocional: '',
    promocaoAtiva: false,
    inicioPromocao: '',
    fimPromocao: '',
    estoque: '',
    categoria: '',
    isFisico: false,
    largura: '',
    altura: '',
    comprimento: '',
    peso: '',
    imagens: [] as string[],
    ativo: true,
    destaque: false
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
      preco: '',
      precoPromocional: '',
      promocaoAtiva: false,
      inicioPromocao: '',
      fimPromocao: '',
      estoque: '',
      categoria: '',
      isFisico: false,
      largura: '',
      altura: '',
      comprimento: '',
      peso: '',
      imagens: [],
      ativo: true,
      destaque: false
    });
    setEditingProduto(null);
    setShowForm(true);
  };
  
  const handleEditClick = (produto: Produto) => {
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: formatarPreco(produto.preco.toString()),
      precoPromocional: produto.precoPromocional ? formatarPreco(produto.precoPromocional.toString()) : '',
      promocaoAtiva: produto.promocaoAtiva,
      inicioPromocao: produto.inicioPromocao ? new Date(produto.inicioPromocao).toISOString().split('T')[0] : '',
      fimPromocao: produto.fimPromocao ? new Date(produto.fimPromocao).toISOString().split('T')[0] : '',
      estoque: produto.estoque.toString(),
      categoria: produto.categoria,
      isFisico: produto.isFisico,
      largura: produto.largura?.toString() || '',
      altura: produto.altura?.toString() || '',
      comprimento: produto.comprimento?.toString() || '',
      peso: produto.peso?.toString() || '',
      imagens: produto.imagens,
      ativo: produto.ativo,
      destaque: produto.destaque
    });
    setEditingProduto(produto);
    setShowForm(true);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'preco' || name === 'precoPromocional') {
      // Formata o valor com R$ e 2 casas decimais
      const valorFormatado = formatarPreco(value);
      setFormData(prev => ({
        ...prev,
        [name]: valorFormatado
      }));
    } else if (name === 'estoque') {
      // Remove qualquer caractere que não seja número
      const apenasNumeros = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: apenasNumeros
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setUploadingImages(true);
    const formData = new FormData();
    
    Array.from(e.target.files).forEach((file) => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload das imagens');
      }

      const data = await response.json();
      if (data.urls && Array.isArray(data.urls)) {
        setFormData(prev => ({
          ...prev,
          imagens: [...prev.imagens, ...data.urls]
        }));
      }

      toast.success('Imagens enviadas com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const dados = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(desformatarPreco(formData.preco)),
        precoPromocional: formData.precoPromocional ? parseFloat(desformatarPreco(formData.precoPromocional)) : undefined,
        promocaoAtiva: formData.promocaoAtiva,
        inicioPromocao: formData.inicioPromocao ? new Date(formData.inicioPromocao) : undefined,
        fimPromocao: formData.fimPromocao ? new Date(formData.fimPromocao) : undefined,
        estoque: parseInt(formData.estoque),
        categoria: formData.categoria,
        isFisico: formData.isFisico,
        largura: formData.isFisico ? parseFloat(formData.largura) : undefined,
        altura: formData.isFisico ? parseFloat(formData.altura) : undefined,
        comprimento: formData.isFisico ? parseFloat(formData.comprimento) : undefined,
        peso: formData.isFisico ? parseFloat(formData.peso) : undefined,
        imagens: formData.imagens,
        ativo: formData.ativo,
        destaque: formData.destaque
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

      if (dados.preco <= 0) {
        toast.error('O preço deve ser maior que zero');
        return;
      }

      if (dados.estoque < 0) {
        toast.error('O estoque não pode ser negativo');
        return;
      }

      if (dados.isFisico) {
        if (!dados.largura || !dados.altura || !dados.comprimento || !dados.peso) {
          toast.error('Produtos físicos devem ter todas as dimensões e peso preenchidos');
          return;
        }
      }

      if (!dados.imagens.length) {
        toast.error('É necessário adicionar pelo menos uma imagem');
        return;
      }

      if (dados.promocaoAtiva) {
        if (!dados.precoPromocional) {
          toast.error('Preço promocional é obrigatório quando a promoção está ativa');
          return;
        }
        if (!dados.inicioPromocao || !dados.fimPromocao) {
          toast.error('Data de início e fim da promoção são obrigatórias');
          return;
        }
        if (dados.inicioPromocao >= dados.fimPromocao) {
          toast.error('Data de início deve ser anterior à data de fim');
          return;
        }
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
            <button
              onClick={handleAddNewClick}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-150 flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Novo Produto
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <h2 className="text-xl text-gray-900 font-bold mb-4">
                  {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Preço</label>
                          <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                              R$
                            </span>
                            <input
                              type="text"
                              name="preco"
                              value={formData.preco}
                              onChange={handleChange}
                              className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Estoque</label>
                          <input
                            type="text"
                            name="estoque"
                            value={formData.estoque}
                            onChange={handleChange}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <input
                          type="text"
                          name="categoria"
                          value={formData.categoria}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Descrição</label>
                      <textarea
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isFisico"
                            checked={formData.isFisico}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Produto Físico</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="ativo"
                            checked={formData.ativo}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Ativo</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="destaque"
                            checked={formData.destaque}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Destaque</span>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center space-x-4 mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="promocaoAtiva"
                              checked={formData.promocaoAtiva}
                              onChange={handleChange}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Ativar Promoção</span>
                          </label>
                        </div>
                        
                        {formData.promocaoAtiva && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Preço Promocional</label>
                              <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                  R$
                                </span>
                                <input
                                  type="text"
                                  name="precoPromocional"
                                  value={formData.precoPromocional}
                                  onChange={handleChange}
                                  className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                                  required={formData.promocaoAtiva}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Início da Promoção</label>
                                <input
                                  type="datetime-local"
                                  name="inicioPromocao"
                                  value={formData.inicioPromocao}
                                  onChange={handleChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                                  required={formData.promocaoAtiva}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Fim da Promoção</label>
                                <input
                                  type="datetime-local"
                                  name="fimPromocao"
                                  value={formData.fimPromocao}
                                  onChange={handleChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                                  required={formData.promocaoAtiva}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {formData.isFisico && (
                      <div className="md:col-span-2">
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <h3 className="text-sm font-medium text-gray-700 mb-4">Dimensões do Produto</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Largura (cm)</label>
                              <input
                                type="number"
                                name="largura"
                                value={formData.largura}
                                onChange={handleChange}
                                step="0.1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                                required={formData.isFisico}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                              <input
                                type="number"
                                name="altura"
                                value={formData.altura}
                                onChange={handleChange}
                                step="0.1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                                required={formData.isFisico}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Comprimento (cm)</label>
                              <input
                                type="number"
                                name="comprimento"
                                value={formData.comprimento}
                                onChange={handleChange}
                                step="0.1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                                required={formData.isFisico}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Peso (g)</label>
                              <input
                                type="number"
                                name="peso"
                                value={formData.peso}
                                onChange={handleChange}
                                step="1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                                required={formData.isFisico}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Imagens</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.imagens.map((imagem, index) => (
                          <div key={index} className="relative">
                            <Image
                              src={imagem}
                              alt={`Imagem ${index + 1}`}
                              width={200}
                              height={200}
                              className="rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG ou WEBP (MAX. 800x800px)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImages}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      disabled={uploadingImages}
                    >
                      {editingProduto ? 'Atualizar' : 'Criar'} Produto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
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
                {filteredProdutos.map((produto) => (
                  <tr key={produto._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {produto.imagens && produto.imagens.length > 0 ? (
                            <Image
                              src={produto.imagens[0]}
                              alt={produto.nome}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm font-medium">
                                {produto.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                          <div className="text-sm text-gray-500">{produto.categoria}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        R$ {produto.preco.toFixed(2)}
                        {produto.promocaoAtiva && produto.precoPromocional && (
                          <div className="mt-1">
                            <span className="text-red-600 font-medium">
                              R$ {produto.precoPromocional.toFixed(2)}
                            </span>
                            <div className="text-xs text-gray-500">
                              {produto.inicioPromocao && produto.fimPromocao && (
                                <>
                                  {new Date(produto.inicioPromocao).toLocaleDateString()} até{' '}
                                  {new Date(produto.fimPromocao).toLocaleDateString()}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{produto.estoque}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          produto.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {produto.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        {produto.destaque && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Destaque
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(produto)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(produto._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar exclusão</h3>
                <p className="text-gray-500 mb-6">
                  Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default Produtos;