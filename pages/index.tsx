import { useState, useEffect } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, PenSquare, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';
import Head from 'next/head'
import DepoimentoModal from '@/components/DepoimentoModal';
import { IDepoimento } from '@/models/Depoimento';

interface Produto {
  _id: string
  nome: string
  descricao: string
  valor: number
  imagemUrl?: string
  imagens?: string[]
}

interface Usuario {
  _id: string;
  nome: string;
  foto?: string;
}

interface DepoimentoCompleto extends Omit<IDepoimento, 'usuario'> {
  usuario: Usuario;
}

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [depoimentos, setDepoimentos] = useState<DepoimentoCompleto[]>([])
  const [isDepoimentoModalOpen, setIsDepoimentoModalOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [produtosRes, depoimentosRes] = await Promise.all([
          axios.get('/api/produtos'),
          axios.get('/api/depoimentos')
        ]);
        setProdutos(produtosRes.data);
        setDepoimentos(depoimentosRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <Head>
        <title>Lemori - Homenagens em Memória</title>
        <meta name="description" content="Crie uma homenagem especial em memória de alguém querido. Compartilhe histórias, fotos e músicas que marcaram uma vida." />
      </Head>
      <Header />
      <div>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6 animate-fade-in">
                Crie sua homenagem
              </h1>
              <p className="text-lg sm:text-xl opacity-90 mb-8">
                Crie uma linda homenagem personalizada para aquele quem voce quer manter a sua memoria.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/register" 
                  className="bg-white text-purple-700 px-6 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transform hover:scale-105 transition duration-200 inline-flex items-center"
                >
                  <PenSquare size={20} className="mr-2" />
                  Crie sua conta
                </Link>
                <Link 
                  href="/shop" 
                  className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-medium text-lg hover:bg-white hover:text-purple-700 transform hover:scale-105 transition duration-200 inline-flex items-center"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Encontrar produtos
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="bg-white p-8 rounded-lg shadow-2xl transform rotate-3 hidden lg:block absolute top-12 -left-8 z-0">
                  <div className="h-32 w-64 bg-gray-100 mb-4 rounded"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-2xl relative z-10">
                  <Image 
                    src="/images/products/homenagem-basica.jpg" 
                    alt="homenagem" 
                    width={500}
                    height={300}
                    className="rounded-lg mb-6 w-full"
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">Suas homenagens</div>
                      <div className="text-sm text-gray-600">Personalize com fotos e músicas</div>
                    </div>
                    <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      Live
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Products */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Produtos em Destaque</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Veja nossos produtos mais comprados.
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                {error}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {produtos.map(produto => (
                    <div key={produto._id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
                      <div className="h-64 overflow-hidden">
                        <Image 
                          src={produto.imagens?.[0] || '/placeholder-image.jpg'} 
                          alt={produto.nome}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover transition duration-300 transform hover:scale-105"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{produto.nome}</h3>
                        <p className="text-gray-600 mb-4">{produto.descricao}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-600 font-bold text-xl">
                            R${(produto.valor || 0).toFixed(2)}
                          </span>
                          <Link href={`/produto?id=${produto._id}`} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-150">
                            Ver detalhes
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-12">
                  <Link href="/shop" className="inline-flex items-center px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition duration-150">
                    <ShoppingCart size={20} className="mr-2" />
                    Veja todos os nossos produtos
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Depoimentos</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Veja o que nossos clientes têm a dizer sobre a nossa plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {depoimentos.map((depoimento) => (
                <div key={depoimento._id} className="bg-white p-8 rounded-lg shadow-md relative">
                  <div className="text-purple-600 absolute -top-4 left-8">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 20H7.5C6.12 20 5 18.88 5 17.5V12.5C5 11.12 6.12 10 7.5 10H12.5C13.88 10 15 11.12 15 12.5V17.5C15 18.88 13.88 20 12.5 20ZM17.5 30H12.5C11.12 30 10 28.88 10 27.5V22.5C10 21.12 11.12 20 12.5 20H17.5C18.88 20 20 21.12 20 22.5V27.5C20 28.88 18.88 30 17.5 30ZM27.5 20H22.5C21.12 20 20 18.88 20 17.5V12.5C20 11.12 21.12 10 22.5 10H27.5C28.88 10 30 11.12 30 12.5V17.5C30 18.88 28.88 20 27.5 20ZM32.5 30H27.5C26.12 30 25 28.88 25 27.5V22.5C25 21.12 26.12 20 27.5 20H32.5C33.88 20 35 21.12 35 22.5V27.5C35 28.88 33.88 30 32.5 30Z" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-6 mt-4">
                    &ldquo;{depoimento.depoimento}&rdquo;
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                      {depoimento.usuario.foto ? (
                        <Image 
                          src={depoimento.usuario.foto} 
                          alt={depoimento.usuario.nome} 
                          width={48}
                          height={48}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                          <span className="text-lg text-purple-600">
                            {depoimento.usuario.nome.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{depoimento.usuario.nome}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botões abaixo dos depoimentos */}
            <div className="flex justify-center gap-4 mt-8">
              <Link
                href="/depoimentos"
                className="inline-flex items-center px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition duration-150"
              >
                Ver todos os depoimentos
              </Link>
              <button
                onClick={() => setIsDepoimentoModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-150"
              >
                <MessageSquare size={20} className="mr-2" />
                Deixe seu depoimento
              </button>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-purple-700 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Pronto para começar?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
              Junte-se a nos e venha criar lindas memorias queridas para aqueles que amamos.
            </p>
            <Link href="/register" className="bg-white text-purple-700 px-8 py-4 rounded-lg font-medium text-lg inline-flex items-center hover:bg-gray-100 transform hover:scale-105 transition duration-200">
              <PenSquare size={24} className="mr-2" />
              Crie sua conta gratuita
            </Link>
          </div>
        </section>
      </div>
      <Footer />
      <DepoimentoModal 
        isOpen={isDepoimentoModalOpen}
        onClose={() => setIsDepoimentoModalOpen(false)}
      />
    </>
  );
}