import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white py-4 px-6 flex justify-between items-center">
      {/* Logo e título */}
      <div className="text-center">
        <h1 className="text-4xl">🌿</h1>
        <h1 className="text-4xl font-bold text-blue-500">LeMori</h1>
        <p className="text-gray-500 italic text-sm">Lembrança e Memória</p>
      </div>
      <nav className="space-x-4">
        <Link href="/dashboard" className="text-gray-600 hover:text-blue-500">Início</Link>
        <Link href="/homenagens/nova" className="text-gray-600 hover:text-blue-500">Nova Homenagem</Link>
        <Link href="/login" className="text-gray-600 hover:text-blue-500">Sair</Link>
      </nav>
    </header>
  )
}
