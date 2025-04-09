import Head from 'next/head'
import Logo from '@/components/Logo'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { login } from '@/lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    try {
      await login(email, senha)
      router.push('/dashboard')
    } catch (err: any) {
      setErro(err.message)
    }
  }

  return (
    <>
      <Head>
        <title>Login | LeMori</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          {/* Logo e título */}
          <Logo />

          {/* Erro */}
          {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

          {/* Formulário */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-gray-600 mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="text-gray-600 mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="text-right">
              <a href="/#" className="text-sm text-blue-500 hover:underline">
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Entrar
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Ainda não tem uma conta?{' '}
            <a href="/register" className="text-purple-600 hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
