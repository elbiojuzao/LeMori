import Head from 'next/head'
import Logo from '@/components/Logo'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()

  useEffect(() => {
    const verificarAutenticacao = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.status === 200) {
          router.replace('/dashboard') // redireciona se já estiver logado
        }
      } catch (error) {
        // Se o token for inválido, segue na tela de login
      }
    }

    verificarAutenticacao()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro no login')
      }

      localStorage.setItem('token', data.token)
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
          <Logo />

          {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

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
