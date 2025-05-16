'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IProduto } from '@/models/Produto';
import { useCart } from '../context/CartContext';
import axios from 'axios';

export default function Shop() {
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    async function loadProdutos() {
      try {
        const response = await axios.get('/api/produtos');
        setProdutos(response.data);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        if (axios.isAxiosError(err) && err.response?.data?.details) {
          setError(`Erro ao carregar produtos: ${err.response.data.details}`);
        } else {
          setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
        }
      } finally {
        setLoading(false);
      }
    }
    loadProdutos();
  }, []);

  const handleAddToCart = (produto: IProduto) => {
    if (!produto._id) return;
    
    const priceValue = Number((produto.valor).toFixed(2));
    
    addItem({
      id: produto._id,
      name: produto.nome,
      price: priceValue,
      description: produto.descricao,
      fullDescription: produto.descricao,
      imageSrc: produto.imagemUrl || '/placeholder-image.jpg',
      category: 'homenagens',
      stock: 1,
      active: true
    }, 1);
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) return (
    <>
      <Header />
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
      <Footer />
    </>
  );

  if (error) return (
    <>
      <Header />
      <div className="text-center py-16 bg-white rounded-lg">
        <p className="text-red-600 text-lg mb-4">Erro: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-150"
        >
          Tentar novamente
        </button>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <div className="bg-gray-50 py-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Produtos para Homenagens</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encontre aqui produtos especiais para criar suas homenagens e guardar recordações.
            </p>
          </div>

          {/* Barra de Pesquisa */}
          <div className="mb-8">
            <div className="relative w-full md:w-1/2 mx-auto">
              <input
                type="text"
                placeholder="Procurar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-600 pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Grid de Produtos */}
          {produtosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {produtosFiltrados.map(produto => (
                <div 
                  key={produto._id || `produto-${produto.nome}`} 
                  className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {produto.imagemUrl && (
                    <div className="relative h-64 group">
                      <img 
                        src={produto.imagemUrl} 
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleAddToCart(produto)}
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="text-white flex items-center space-x-2">
                          <ShoppingCart size={24} />
                          <span>Adicionar ao carrinho</span>
                        </div>
                      </button>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-purple-600 transition duration-150">
                      {produto.nome}
                    </h3>
                    <p className="text-gray-600 mb-4">{produto.descricao}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-600 font-bold text-xl">
                        R$ {produto.valor.toFixed(2)}
                      </span>
                      <div className="flex space-x-2">
                        {produto._id ? (
                          <>
                            <Link 
                              href={`/produtos/${produto._id}`}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-150"
                            >
                              Ver detalhes
                            </Link>
                            <button
                              onClick={() => handleAddToCart(produto)}
                              className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition duration-150 flex items-center"
                              title="Adicionar ao carrinho"
                            >
                              <ShoppingCart size={20} />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                            disabled
                          >
                            Indisponível
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg">
              <p className="text-gray-600 text-lg mb-4">Nenhum produto encontrado</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-150"
              >
                Limpar Filtro
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}