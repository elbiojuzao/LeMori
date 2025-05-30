import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CreditCard, Banknote, Check, Loader2, MapPin, Tag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Head from 'next/head';
import { toast } from 'react-hot-toast';

interface Endereco {
  _id: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  userId: string;
}

export default function Checkout() {
  const router = useRouter();
  const { items, subtotal, shipping, discount, total, applyCoupon, shippingOptions, selectedShippingOption, calculateShipping, selectShippingOption } = useCart();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [cep, setCep] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mercado-pago' | 'pix'>('mercado-pago');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const hasPhysicalProduct = items.some((item) => item.product.isFisico);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Só busca endereços se houver produto físico
    if (hasPhysicalProduct) {
      const fetchEnderecos = async () => {
        try {
          const response = await axios.get('/api/users/addresses', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEnderecos(response.data.addresses);
          if (response.data.addresses.length > 0) {
            setSelectedAddressId(response.data.addresses[0]._id);
            setCep(response.data.addresses[0].cep);
          }
        } catch (error) {
          console.error('Erro ao carregar endereços:', error);
          setError('Erro ao carregar endereços. Por favor, tente novamente.');
        }
      };

      fetchEnderecos();
    }
  }, [router, hasPhysicalProduct]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um cupom válido');
      return;
    }

    const success = applyCoupon(couponCode.trim().toUpperCase());
    if (!success) {
      setCouponError('Cupom inválido ou expirado');
    } else {
      setCouponError(null);
      setCouponCode('');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasPhysicalProduct) {
      if (!selectedAddressId) {
        setError('Selecione um endereço de entrega');
        return;
      }

      if (!selectedShippingOption) {
        setError('Selecione uma opção de frete');
        return;
      }

      if (!cep || cep.length < 8) {
        setError('Digite um CEP válido para calcular o frete');
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            _id: item.product.id,
            nome: item.product.name,
            quantidade: item.quantity,
            valor: item.product.price,
            isFisico: item.product.isFisico || false,
          })),
          endereco: hasPhysicalProduct ? enderecos.find((addr) => addr._id === selectedAddressId) : null,
          paymentMethod,
          total,
          shipping: hasPhysicalProduct && selectedShippingOption ? selectedShippingOption.price : 0,
          discount,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pagamento');
      }

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('URL de pagamento não encontrada');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCalculateShipping = async () => {
    if (!cep || cep.length < 8) {
      setError('Digite um CEP válido para calcular o frete.');
      return;
    }
    setIsCalculatingShipping(true);
    setError(null);
    try {
      await calculateShipping(cep);
    } catch {
      setError('Erro ao calcular o frete. Tente novamente.');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  if (items.length === 0) return null;

  if (hasPhysicalProduct && enderecos.length === 0) {
    return (
      <>
        <Head>
          <title>Checkout | Lemori</title>
          <meta name="description" content="Finalize sua compra e crie sua homenagem em memória" />
        </Head>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <MapPin className="h-12 w-12 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Nenhum endereço cadastrado</h1>
            <p className="text-lg text-gray-600 mb-8">
              Você precisa cadastrar um endereço antes de finalizar a compra.
            </p>
            <button
              onClick={() => router.push('/endereco')}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-150"
            >
              Cadastrar Endereço
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário de Checkout */}
            <div className="lg:col-span-2 space-y-6">
              {/* Seção de Endereço - Só mostra se houver produto físico */}
              {hasPhysicalProduct && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                    Endereço de Entrega
                  </h2>
                  
                  {enderecos.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">Você precisa cadastrar um endereço para receber seu produto físico.</p>
                      <button
                        onClick={() => router.push('/endereco')}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Cadastrar Endereço
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enderecos.map((endereco) => (
                        <div key={endereco._id} className="flex items-start p-4 border rounded-lg hover:border-purple-500 transition-colors">
                          <input
                            type="radio"
                            id={`address-${endereco._id}`}
                            name="shipping-address"
                            checked={selectedAddressId === endereco._id}
                            onChange={() => {
                              setSelectedAddressId(endereco._id);
                              setCep(endereco.cep);
                            }}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor={`address-${endereco._id}`} className="ml-3 block flex-1 cursor-pointer">
                            <div className="text-gray-900 font-medium">
                              {endereco.rua}, {endereco.numero}
                            </div>
                            <div className="text-gray-600 text-sm mt-1">
                              {endereco.complemento && `${endereco.complemento}, `}
                              {endereco.bairro}, {endereco.cidade} - {endereco.estado}
                            </div>
                            <div className="text-gray-600 text-sm mt-1">
                              CEP: {endereco.cep}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => router.push('/endereco')}
                    className="mt-4 text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Adicionar novo endereço
                  </button>
                </div>
              )}

              {/* Seção de Pagamento */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                  Método de Pagamento
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start p-4 border rounded-lg hover:border-purple-500 transition-colors">
                    <input
                      type="radio"
                      id="mercado-pago"
                      name="payment-method"
                      checked={paymentMethod === 'mercado-pago'}
                      onChange={() => setPaymentMethod('mercado-pago')}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="mercado-pago" className="ml-3 block flex-1 cursor-pointer">
                      <div className="flex items-center text-gray-900 font-medium">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Mercado Pago
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        Cartão de crédito, débito ou boleto
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-start p-4 border rounded-lg hover:border-purple-500 transition-colors">
                    <input
                      type="radio"
                      id="pix"
                      name="payment-method"
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="pix" className="ml-3 block flex-1 cursor-pointer">
                      <div className="flex items-center text-gray-900 font-medium">
                        <Banknote className="mr-2 h-5 w-5" />
                        Pix
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        Pagamento instantâneo
                      </div>
                    </label>
                  </div>
                </div>

                {/* Informações de Segurança */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Pagamento Seguro</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Todos os pagamentos são processados pelo Mercado Pago, garantindo a segurança dos seus dados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-purple-600" />
                  Resumo do Pedido
                </h2>

                <div className="space-y-6">
                  {/* Campo de cálculo de frete - Só mostra se houver produto físico */}
                  {hasPhysicalProduct && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        CEP para cálculo do frete <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cep}
                          onChange={e => setCep(e.target.value.replace(/\D/g, ''))}
                          maxLength={8}
                          className="text-gray-400 flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Digite o CEP"
                        />
                        <button
                          type="button"
                          onClick={handleCalculateShipping}
                          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                          disabled={isCalculatingShipping || !cep || cep.length < 8}
                        >
                          {isCalculatingShipping ? 'Calculando' : 'Calcular'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Exibir opções de frete - Só mostra se houver produto físico */}
                  {hasPhysicalProduct && shippingOptions.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Opções de frete <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {shippingOptions.map(option => (
                          <div key={option.id} className="flex items-center p-2 hover:bg-white rounded-md transition-colors">
                            <input
                              type="radio"
                              name="shipping-option"
                              checked={selectedShippingOption?.id === option.id}
                              onChange={() => selectShippingOption(option)}
                              className="h-4 w-4 text-purple-600"
                            />
                            <span className="ml-2 text-gray-700">
                              {option.name} - R$ {option.price.toFixed(2)} ({option.delivery_time} dias)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Itens do pedido */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium text-gray-900">{item.quantity}x</span>{' '}
                          <span className="text-gray-600">{item.product.name}</span>
                        </div>
                        <span className="text-gray-900">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frete</span>
                      <span className="text-gray-900">R$ {shipping.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto</span>
                        <span>- R$ {discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Campo de Cupom */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Cupom de desconto</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Digite seu cupom"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-2 text-sm text-red-600">{couponError}</p>
                    )}
                  </div>

                  {/* Botão de Finalizar Compra */}
                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Finalizar Compra - R$ {total.toFixed(2)}
                      </>
                    )}
                  </button>
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