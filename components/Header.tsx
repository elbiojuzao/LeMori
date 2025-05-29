import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { ShoppingCart, User, Menu, X, LogOut, Home, ShoppingBag } from 'lucide-react'
import Logo from '@/components/Logo'
import { logout, isAuthenticated } from '@/lib/authClient'
import { useCart } from '../context/CartContext'

const Header = () => {
  const router = useRouter()
  const [autenticado, setAutenticado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { items, totalItems, total, removeItem } = useCart()
  
  useEffect(() => {
    setAutenticado(isAuthenticated())
    setLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
    setMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleCart = () => {
    setCartOpen(!cartOpen)
  }
  
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/" className={`text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition duration-150 ${router.pathname === '/dashboard' ? 'text-purple-600' : ''}`}>
                Início
              </Link>
              <Link href="/shop" className={`text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition duration-150 ${router.pathname === '/shop' ? 'text-purple-600' : ''}`}>
                Loja
              </Link>
              {!loading && autenticado && (
                <Link href="/perfil" className={`text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition duration-150 ${router.pathname === '/perfil' ? 'text-purple-600' : ''}`}>
                  Meu Perfil
                </Link>
              )}
            </nav>
          </div>
          
          {/* User actions */}
          <div className="flex items-center">
            {/* Cart */}
            <div className="ml-4 relative">
              <button 
                onClick={toggleCart}
                className="flex items-center text-gray-600 hover:text-purple-600 focus:outline-none"
              >
                <div className="relative">
                  <ShoppingCart size={24} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </button>

              {/* Cart Dropdown */}
              {cartOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Carrinho de Compras</h3>
                    {items.length > 0 ? (
                      <>
                        <div className="space-y-4 max-h-96 overflow-auto">
                          {items.map((item) => (
                            <div key={item.product.id} className="flex items-center space-x-4">
                              {item.product.imageSrc ? (
                                <Image 
                                  src={item.product.imageSrc} 
                                  alt={item.product.name} 
                                  width={64}
                                  height={64}
                                  className="rounded-md object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} x R$ {item.product.price.toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Total</p>
                            <p>R${total.toFixed(2)}</p>
                          </div>
                          <div className="mt-4">
                            <Link
                              href="/checkout"
                              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-150 text-center block"
                            >
                              Finalizar Compra
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Seu carrinho está vazio</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!loading && autenticado ? (
              <div className="ml-4 relative hidden md:block">
                <div className="group relative">
                  <button className="flex items-center text-gray-600 hover:text-purple-600 focus:outline-none">
                    <User size={24} />
                  </button>
                  <div className="absolute right-0 w-48 mt-1 py-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-2 before:-translate-y-full">
                    <Link href="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${router.pathname === '/perfil' ? 'text-purple-600' : ''}">
                      Perfil
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ml-4 hidden md:flex items-center space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-purple-600 font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-150">
                  Registrar
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="ml-4 md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 hover:text-purple-600 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/dashboard" 
            className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 ${router.pathname === '/dashboard' ? 'text-purple-600' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center">
              <Home size={18} className="mr-2" />
              Início
            </div>
          </Link>
          <Link 
            href="/shop" 
            className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 ${router.pathname === '/shop' ? 'text-purple-600' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center">
              <ShoppingCart size={18} className="mr-2" />
              Loja
            </div>
          </Link>
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          {!loading && autenticado ? (
            <>
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <User size={40} className="h-10 w-10 rounded-full bg-gray-100 p-2 text-gray-600" />
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Link 
                  href="/perfil" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Perfil
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                >
                  <LogOut size={18} className="mr-2" />
                  Sair
                </button>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-1 px-2">
              <Link 
                href="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-purple-600 hover:bg-gray-50 bg-purple-600 text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Registrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 