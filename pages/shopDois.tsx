'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types/product';
import clientApi from '../lib/clientApi';

const ShopPage: React.FC = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data } = await clientApi.get('/products');
        setProducts(data);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addItem({ 
      ...product, 
      id: product._id, 
      imageSrc: product.imageSrc ?? '',
      category: product.category ?? 'Outros'
    }, 1);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-16 bg-white rounded-lg">
      <p className="text-red-600 text-lg mb-4">Erro: {error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-150"
      >
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Produtos de homenagens</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre aqui na nossa loja produtos para você criar uma homenagem e ter recordações.
          </p>
        </div>
        {/* Filtros Ativos */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="Procurar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Produtos*/}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
                <Link href={`/product/${product._id}`} className="block">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={product.imageSrc} 
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-300 transform hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <Link href={`/product/${product._id}`} className="block">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-purple-600 transition duration-150">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                  </Link>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 font-bold text-xl">R${product.price.toFixed(2)}</span>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/product/${product._id}`}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition duration-150"
                      >
                        Detalhes
                      </Link>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition duration-150 flex items-center"
                      >
                        <ShoppingCart size={18} className="mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-gray-600 text-lg mb-4">Nem um produto encontrado com este filtro</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-150"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;