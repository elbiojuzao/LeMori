import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { User, Mail, Lock, AlertCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verificarAutenticacao = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.status === 200) router.replace('/perfil')
      } catch {}
    }

    verificarAutenticacao()
  }, [router])

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    termos: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    // Validação dos campos
    if (!formData.nome.trim()) {
      setErrorMessage('Por favor, preencha seu nome.')
      setIsLoading(false)
      return
    }

    if (!formData.cpf.trim()) {
      setErrorMessage('Por favor, preencha seu CPF.')
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setErrorMessage('Por favor, preencha seu email.')
      setIsLoading(false)
      return
    }

    if (!formData.senha) {
      setErrorMessage('Por favor, preencha sua senha.')
      setIsLoading(false)
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErrorMessage('As senhas não coincidem.')
      setIsLoading(false)
      return
    }

    if (!formData.termos) {
      setErrorMessage('Por favor, aceite os termos de uso.')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          cpf: formData.cpf,
          email: formData.email,
          senha: formData.senha,
        }),
      })

      if (res.ok) {
        router.push('/sucesso')
      } else {
        const data = await res.json()
        setErrorMessage(data.error || 'Erro ao registrar usuário.')
      }
    } catch {
      setErrorMessage('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Criar Conta | Lemori</title>
        <meta name="description" content="Crie sua conta para começar a criar homenagens em memória" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Crie sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ou{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                entre com uma conta existente.
              </Link>
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                    Nome completo
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-700" />
                    </div>
                    <input
                      id="nome"
                      name="nome"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.nome}
                      onChange={handleChange}
                      className="block text-gray-700 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Nome e sobrenome"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                    CPF
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="cpf"
                      name="cpf"
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={handleChange}
                      className="block text-gray-700 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block text-gray-700 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="SeuEmail@exemplo.com.br"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="senha"
                      name="senha"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.senha}
                      onChange={handleChange}
                      className="block text-gray-700 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
                    Confirmar senha
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      className="block text-gray-700 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="termos"
                    name="termos"
                    type="checkbox"
                    required
                    checked={formData.termos}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="termos" className="ml-2 block text-sm text-gray-700">
                    Eu concordo com os{' '}
                    <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                      Termos de Serviço
                    </a>{' '}
                    e{' '}
                    <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                      Politica de Privacidade
                    </a>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    }`}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
