import Link from 'next/link'
import Logo from '@/components/logo'

export default function Header() {
  return (
    <header className="bg-white py-4 px-6 flex justify-between items-center">
      {/* Logo e título */}
      <Logo />
      <nav className="space-x-4">
        <Link href="/dashboard" className="text-gray-600 hover:text-blue-500">Início</Link>
        <Link href="/homenagens/nova" className="text-gray-600 hover:text-blue-500">Nova Homenagem</Link>
        <Link href="/login" className="text-gray-600 hover:text-blue-500">Sair</Link>
      </nav>
    </header>
  )
}
