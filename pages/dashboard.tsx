import Head from 'next/head'
import { Menu } from '@headlessui/react'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
} from '@heroicons/react/24/solid'


export default function Dashboard() {
  // Simulação de dados do usuário e homenagens
  const user = {
    nome: 'João da Silva',
    email: 'joao@email.com'
  }

  const homenagens = [
    { id: 1, nome: 'Maria Silva', data: '10/03/2022' },
    { id: 2, nome: 'José Pereira', data: '25/12/2021' }
  ]

  return (
    <>
      <Head>
        <title>Dashboard | LeMori</title>
      </Head>
        {/* Logo e título */}
        <div className="justify-between bg-gradient-to-br from-purple-100 to-purple-300 px-4">
          <div className="text-center">
            <h1 className="text-4xl">🌿</h1>
            <h1 className="text-4xl font-bold text-blue-500">LeMori</h1>
            <p className="text-gray-500 italic text-sm">Lembrança e Memória</p>
          </div>
        </div>

      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Bem-vindo, {user.nome}</h1>
          <p className="text-gray-600 mb-6">Email: {user.email}</p>

          <h2 className="text-xl font-semibold text-gray-700 mb-2">Suas homenagens</h2>
          <ul className="space-y-2">
          {homenagens.map((homenagem) => (
            <li
              key={homenagem.id}
              className="relative bg-purple-100 p-3 rounded-md shadow-sm hover:bg-purple-200 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-800">{homenagem.nome}</div>
                  <div className="text-sm text-gray-600">Criado em: {homenagem.data}</div>
                </div>

                {/* Botão de opções */}
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="p-1 hover:bg-purple-300 rounded-full">
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                  </Menu.Button>

                  <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-10">
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-blue-100' : ''
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                            onClick={() => alert(`Editar ${homenagem.nome}`)}
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Alterar
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-blue-100' : ''
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                            onClick={() => alert(`Ver planos de ${homenagem.nome}`)}
                          >
                            <StarIcon className="h-4 w-4 mr-2" />
                            Planos
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-red-100' : ''
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600`}
                            onClick={() => alert(`Excluir ${homenagem.nome}`)}
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
          ))}

          </ul>

          <div className="mt-6 flex gap-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Criar nova homenagem
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
