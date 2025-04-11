import Link from 'next/link'
import Logo from '@/components/Logo'
import { useRouter } from 'next/router'
import { logout } from '@/lib/authClient'
import { useEffect, useState } from 'react'

export default function Header() {
  const router = useRouter()
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setAutenticado(!!token)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="bg-white py-4 px-6 flex justify-between items-center">
      <Logo />
      <nav className="space-x-4">
        <Link href="/dashboard" className="text-gray-600 hover:text-blue-500">Início</Link>
        <Link href="/homenagem/form" className="text-gray-600 hover:text-blue-500">Nova Homenagem</Link>
        {autenticado ? (
          <button onClick={handleLogout} className="text-gray-600 hover:text-blue-500">
            Sair
          </button>
        ) : (
          <Link href="/login" className="text-gray-600 hover:text-blue-500">Entrar</Link>
        )}
      </nav>
    </header>
  )
}
