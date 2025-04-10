import Head from 'next/head'
import { Menu } from '@headlessui/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
} from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'
import withAuth from '@/lib/withAuth'
import { useRouter } from 'next/router'

function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ nome: string; email: string } | null>(null)
  const [homenagens, setHomenagens] = useState<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('Token não encontrado no localStorage')
        return
      }

      try {
        const resUser = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = await resUser.json()

        if (!userData._id) {
          console.error('ID do usuário ausente')
          return
        }

        setUser(userData)

        const resHomenagens = await fetch(`/api/homenagens/user/${userData._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const homenagensData = await resHomenagens.json()

        setHomenagens(homenagensData)
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err)
      }
    }

    fetchData()
  }, [])

  const handleCriarNova = () => {
    router.push('/homenagem/form')
  }

  const handleEditar = (id: string) => {
    router.push(`/homenagem/form?id=${id}`)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 flex-col">
        <p>Carregando dashboard...</p>
        <p className="text-sm text-red-500 mt-4">
          Se ficar travado aqui, verifique o token ou a resposta da API `/api/auth/me`.
        </p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Bem-vindo, {user.nome}</h1>

          <h2 className="text-xl font-semibold text-gray-700 mb-2">Suas homenagens</h2>
          <ul className="space-y-2">
            {homenagens.length === 0 ? (
              <p className="text-gray-500">Nenhuma homenagem criada ainda.</p>
            ) : (
              homenagens.map((homenagem) => (
                <li
                  key={homenagem._id}
                  className="relative bg-purple-100 p-3 rounded-md shadow-sm hover:bg-purple-200 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">{homenagem.nomeHomenageado}</div>
                      <div className="text-sm text-gray-600">
                        Criado em: {new Date(homenagem.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-1 hover:bg-purple-300 rounded-full">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                      </Menu.Button>

                      <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-10">
                        <div className="p-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`$${active ? 'bg-blue-100' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                                onClick={() => handleEditar(homenagem._id)}
                              >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Alterar
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`$${active ? 'bg-blue-100' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                                onClick={() => alert(`Ver planos de ${homenagem.nomeHomenageado}`)}
                              >
                                <StarIcon className="h-4 w-4 mr-2" />
                                Planos
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`$${active ? 'bg-red-100' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600`}
                                onClick={() => alert(`Excluir ${homenagem.nomeHomenageado}`)}
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Excluir
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Menu>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="mt-6 flex gap-4">
            <button onClick={handleCriarNova}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition" >
              Criar Nova Homenagem
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={() => {
                localStorage.removeItem('token')
                window.location.href = '/login'
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default withAuth(Dashboard)
