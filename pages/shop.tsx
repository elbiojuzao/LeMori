'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IProduto } from '@/models/Produto';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Head from 'next/head'

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
      imageSrc: '/placeholder-image.jpg',
      category: 'produtos',
      stock: 1,
      active: true
    }, 1);
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Head>
          <title>Loja | Lemori</title>
          <meta name="description" content="Encontre os melhores planos para criar sua homenagem em memória" />
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="animate-pulse flex justify-center items-center h-64">
            <div className="text-2xl text-gray-500">Carregando produtos...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Loja | Lemori</title>
          <meta name="description" content="Encontre os melhores planos para criar sua homenagem em memória" />
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Loja | Lemori</title>
        <meta name="description" content="Encontre os melhores planos para criar sua homenagem em memória" />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-xl">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {produtosFiltrados.map(produto => (
                <div 
                  key={produto._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
                >
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
                        <Link 
                          href={`/produto?id=${produto._id}`}
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}