import Link from 'next/link'
import Logo from '@/components/Logo'
import { useRouter } from 'next/router'
import { logout } from '@/lib/authClient'
import { useEffect, useState } from 'react'

export default function Header() {
  const router = useRouter()
  const [autenticado, setAutenticado] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setAutenticado(!!token)
    setLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const estaNaDashboard = router.pathname.startsWith('/dashboard') || router.pathname.startsWith('/homenagem')

  return (
    <header className="bg-white py-4 px-6 flex justify-between items-center">
      <Logo />
      <nav className="space-x-4 flex items-center">
        <Link href="/dashboard" className="text-gray-600 hover:text-blue-500">Início</Link>
        <Link href="/homenagem/form" className="text-gray-600 hover:text-blue-500">Nova Homenagem</Link>

        {!loading && autenticado && estaNaDashboard && (
          <Link
            href="/perfil"
            className="text-gray-600 hover:text-purple-600 font-medium"
          >
            Meu Perfil
          </Link>
        )}

        {!loading && (
          autenticado ? (
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-500"
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
