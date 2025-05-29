'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { ShoppingCart, ChevronLeft, Plus, Minus, Check, Star, Truck, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '../context/CartContext';
import { IProduto } from '@/models/Produto';
import axios from 'axios';

export default function ProductPage() {
  const router = useRouter()
  const { id } = router.query
  const { addItem } = useCart();
  const [product, setProduct] = useState<IProduto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/produtos/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError('Erro ao carregar o produto. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    if (product) {
      addItem({
        _id: product._id,
        id: product._id,
        name: product.nome,
        price: product.preco,
        description: product.descricao,
        fullDescription: product.descricao,
        imageSrc: product.imagens?.[0] || '/placeholder-image.jpg',
        category: 'homenagens',
        stock: 1,
        active: true,
        isFisico: product.isFisico,
        width: product.largura || 0,
        height: product.altura || 0,
        length: product.comprimento || 0,
        weight: product.peso || 0
      }, quantity);
      
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };
  
  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.min(Math.max(1, value), 10);
    setQuantity(newQuantity);
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-lg text-gray-500 mb-4">{error || 'Produto não encontrado'}</p>
            <button 
              onClick={() => router.push('/shop')}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-150"
            >
              Voltar para Loja
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      <div className="bg-gray-50 py-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <button 
              onClick={() => router.push('/shop')}
              className="flex items-center text-gray-500 hover:text-purple-600 transition duration-150"
            >
              <ChevronLeft size={20} className="mr-1" />
              Voltar para Loja
            </button>
          </div>
          
          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
              {/* Product Image */}
              <div className="rounded-lg overflow-hidden">
                <Image 
                  src={product.imagens?.[0] || '/placeholder-image.jpg'} 
                  alt={product.nome}
                  width={800}
                  height={500}
                  className="w-full h-[500px] object-cover"
                />
              </div>
              
              {/* Product Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-500 mb-4">{product.nome}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-500">(12 avaliações)</span>
                </div>
                
                <p className="text-2xl font-bold text-purple-600 mb-6">
                  R$ {product.preco.toFixed(2)}
                </p>
                
                <div className="mb-8">
                  <p className="text-gray-500 mb-4">{product.descricao}</p>
                </div>
                
                {/* Benefícios */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-500">
                    <Truck className="h-5 w-5 mr-2" />
                    <span>Entrega em todo Brasil</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Shield className="h-5 w-5 mr-2" />
                    <span>Garantia de satisfação</span>
                  </div>
                </div>
                
                {/* Add to Cart */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-36">
                    <button 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition duration-150"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} className="text-gray-500" />
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 h-10 text-center focus:outline-none border-x border-gray-300 text-gray-500"
                    />
                    <button 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition duration-150"
                      disabled={quantity >= 10}
                    >
                      <Plus size={16} className="text-gray-500" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center transition duration-200 ${
                      addedToCart 
                        ? 'bg-green-600 text-white' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={20} className="mr-2" />
                        Adicionado ao carrinho
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} className="mr-2" />
                        Adicionar ao carrinho
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Descrição Detalhada e Avaliações */}
            <div className="border-t border-gray-200">
              <div className="p-8">
                <h2 className="text-xl font-semibold text-gray-500 mb-4">Descrição Detalhada</h2>
                <div className="prose max-w-none text-gray-500">
                  <p>{product.descricao}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}