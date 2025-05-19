import Link from 'next/link';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login')
      return
    }

    const verificarAdmin = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const user = await res.json()
          if (user.isAdmin) {
            setAuthorized(true)
          } else {
            router.push('/403')
          }
        } else {
          router.push('/login')
        }
      } catch (err) {
        console.error('Erro ao verificar admin:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    verificarAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Verificando acesso de administrador...
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Barra Lateral */}
      <aside className="bg-gray-800 text-white w-64 py-6 px-3 flex flex-col">
        <div className="mb-8">
          <Link href="/admin" className="text-xl font-bold hover:text-primary transition duration-200">
            Painel de Administração
          </Link>
        </div>
        <nav className="flex-grow">
          <ul>
            <li className="mb-2">
              <Link href="/admin" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/admin/homenagens" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                Homenagens
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/admin/usuarios" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                Usuários
              </Link>
            </li>
            <li>
              <Link href="/admin/cupons" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                Cupons
              </Link>
            </li>
            <li>
              <Link href="/admin/pedidos" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                Pedidos
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-8">
          <Link href="/" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
            Voltar ao Site
          </Link>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}