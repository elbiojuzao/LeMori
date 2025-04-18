import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Head from 'next/head'

interface FormValues {
  nome: string
  cpf: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  email: string
}

export default function Perfil() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormValues>({
    nome: '',
    cpf: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    email: '',
  })

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      try {
        const res = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const user = res.data
        setForm({
          nome: user.nome || '',
          cpf: user.cpf || '',
          rua: user.rua || '',
          numero: user.numero || '',
          complemento: user.complemento || '',
          bairro: user.bairro || '',
          cidade: user.cidade || '',
          estado: user.estado || '',
          email: user.email || '',
        })
        setLoading(false)
      } catch (err) {
        router.push('/login')
      }
    }

    fetchUser()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const res = await axios.put('/api/users/me', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      alert('Dados atualizados com sucesso!')
    } catch (err) {
      console.error(err)
      alert('Erro ao atualizar dados.')
    }
  }

  if (loading) return <p className="text-center mt-1 text-gray-4000">Carregando dados...</p>

  return (
    <>
      <Head>
        <title>Perfil | LeMori</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-blue-500 mb-6 text-center">Seu Perfil</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Nome</label>
              <input type="text" name="nome" value={form.nome} onChange={handleChange} className="mt-1 text-gray-400 p-2 border rounded-md w-full" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">CPF</label>
              <input type="text" name="cpf" value={form.cpf} disabled className="mt-1 text-gray-400 p-2 border rounded-md w-full bg-gray-100" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Rua</label>
              <input type="text" name="rua" value={form.rua} onChange={handleChange} className="mt-1 text-gray-400 p-2 border rounded-md w-full" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Número</label>
              <input type="text" name="numero" value={form.numero} onChange={handleChange} className="mt-1 text-gray-400 p-2 border rounded-md w-full" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Complemento</label>
              <input type="text" name="complemento" value={form.complemento} onChange={handleChange} className="mt-1 text-gray-400 p-2 border rounded-md w-full" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Bairro</label>
              <input type="text" name="bairro" value={form.bairro} onChange={handleChange} className="mt-1 text-gray-400 p-2 border rounded-md w-full" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Cidade</label>
              <input type="text" name="cidade" value={form.cidade} onChange={handleChange} className="mt-1 text-gray-400 p-2 border rounded-md w-full" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <input type="text" name="estado" value={form.estado} onChange={handleChange} className="mt-1 text-gray-400 p-2 border rounded-md w-full" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input type="email" name="email" value={form.email} disabled className="mt-1 text-gray-400 p-2 border rounded-md w-full bg-gray-100" />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition">
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}