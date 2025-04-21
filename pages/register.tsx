import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Register() {
  const router = useRouter()

  useEffect(() => {
    const verificarAutenticacao = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.status === 200) router.replace('/dashboard')
      } catch {}
    }

    verificarAutenticacao()
  }, [])

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    termos: false,
  })

  const [errors, setErrors] = useState({
    nome: false,
    cpf: false,
    email: false,
    senha: false,
    confirmarSenha: false,
    termos: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors(prev => ({ ...prev, [name]: false })) // limpa erro ao digitar
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const novosErros = {
      nome: !form.nome.trim(),
      cpf: !form.cpf.trim(),
      email: !form.email.trim(),
      senha: !form.senha,
      confirmarSenha: form.senha !== form.confirmarSenha,
      termos: !form.termos,
    }

    setErrors(novosErros)

    const temErros = Object.values(novosErros).some(Boolean)
    if (temErros) return

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          cpf: form.cpf,
          email: form.email,
          senha: form.senha,
        }),
      })

      if (res.ok) {
        router.push('/sucesso')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao registrar usuário.')
      }
    } catch (err) {
      alert('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <>
      <Head><title>Cadastro | LeMori</title></Head>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-4xl">🌿</h1>
            <h1 className="text-4xl font-bold text-blue-500">LeMori</h1>
            <p className="text-gray-500 italic text-sm">Lembrança e Memória</p>
          </div>

          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nome completo</label>
              <input type="text" name="nome" value={form.nome} onChange={handleChange} className="text-gray-600 mt-1 w-full p-2 border rounded-md" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">CPF</label>
              <input type="text" name="cpf" value={form.cpf} onChange={handleChange} className="text-gray-600 mt-1 w-full p-2 border rounded-md" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="text-gray-600 mt-1 w-full p-2 border rounded-md" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input type="password" name="senha" value={form.senha} onChange={handleChange} className="text-gray-600 mt-1 w-full p-2 border rounded-md" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Confirmação de Senha</label>
              <input type="password" name="confirmarSenha" value={form.confirmarSenha} onChange={handleChange} className="text-gray-600 mt-1 w-full p-2 border rounded-md" required />
            </div>

            <div className="md:col-span-2 flex items-center">
              <input type="checkbox" name="termos" checked={form.termos} onChange={handleChange} className="mr-2" required />
              <label className="text-sm text-gray-700">Aceito os termos de adesão</label>
            </div>
            {errors.termos && <p className="text-sm text-red-500">Você precisa aceitar os termos</p>}

            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition">
              Cadastrar
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
