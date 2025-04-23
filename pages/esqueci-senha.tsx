import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function EsqueciSenha() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const verificarAutenticacao = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 200) router.replace('/dashboard')
      } catch {}
    }

    verificarAutenticacao()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setCarregando(true)

    try {
      await axios.post('/api/auth/esqueci-senha', { email })
      setSucesso('E-mail enviado com sucesso! Verifique sua caixa de entrada.')
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <Head><title>Esqueci minha senha | LeMori</title></Head>

      <div className="bg-[#ececdd] flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-4xl">🌿</h1>
            <h1 className="text-4xl font-bold text-blue-500">LeMori</h1>
            <p className="text-gray-500 italic text-sm">Lembrança e Memória</p>
          </div>

          <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Digite seu e-mail</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-gray-600 mt-1 w-full p-2 border rounded-md"
                required
              />
            </div>

            {erro && <p className="text-sm text-red-500">{erro}</p>}
            {sucesso && <p className="text-sm text-green-600">{sucesso}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              {carregando ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}