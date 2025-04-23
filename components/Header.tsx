import Link from 'next/link'
import Logo from '@/components/Logo'
import { useRouter } from 'next/router'
import { logout, isAuthenticated } from '@/lib/authClient'
import { useEffect, useState } from 'react'

export default function Header() {
  const router = useRouter()
  const [autenticado, setAutenticado] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAutenticado(isAuthenticated())
    setLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const estaNaDashboard = router.pathname.startsWith('/dashboard') || router.pathname.startsWith('/homenagem')

  return (
    <header className="bg-[#e4ddd6] py-4 px-6 flex justify-between items-center">
      <Logo className="h-18 w-auto" />
      <nav className="space-x-4 flex items-center" aria-label="Menu principal">
        <Link href="/dashboard" className={`text-gray-600 hover:text-blue-500 ${router.pathname === '/dashboard' ? 'font-bold text-blue-600' : ''}`}>Início</Link>
        <Link href="/homenagem/form" className={`text-gray-600 hover:text-blue-500 ${router.pathname === '/homenagem/form' ? 'font-bold text-blue-600' : ''}`}>Nova Homenagem</Link>

        {!loading && autenticado && estaNaDashboard && (
          <Link
            href="/perfil"
            className={`text-gray-600 hover:text-purple-600 font-medium ${router.pathname === '/perfil' ? 'font-bold text-purple-600' : ''}`}
          >
            Meu Perfil
          </Link>
        )}

        {!loading && (
          autenticado ? (
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-500"
              aria-label="Sair da conta"
            >
              Sair
            </button>
          ) : (
            <Link href="/login" className="text-gray-600 hover:text-blue-500">Entrar</Link>
          )
        )}
      </nav>
    </header>
  )
}
