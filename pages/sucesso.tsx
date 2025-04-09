import Head from 'next/head'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Success() {
  return (
    <>
      <Head>
        <title>Cadastro realizado</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className='p-8'><Logo /></div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Cadastro realizado com sucesso!</h2>
          <p className="text-gray-600 mb-6">Sua conta foi criada. Agora você pode acessar o sistema.</p>

          <Link href="/login">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition">
              Ir para o Login
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}
