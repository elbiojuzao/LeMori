import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function RedefinirSenha() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [token, setToken] = useState('')

  useEffect(() => {
    const queryToken = router.query.token
    if (typeof queryToken === 'string') {
      setToken(queryToken)
    }
  }, [router.query])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    
    if (!senha || !confirmarSenha) {
      setErro('Preencha todos os campos.')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)

    try {
      const res = await axios.post('/api/auth/resetar-senha', {
        token,
        novaSenha: senha,
      })

      setSucesso('Senha redefinida com sucesso! Você será redirecionado para o login...')
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao redefinir senha.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <Head><title>Redefinir senha | LeMori</title></Head>

      <div className="flex min-h-screen items-center justify-center bg-[#ececdd] px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-4xl">🌿</h1>
            <h1 className="text-4xl font-bold text-blue-500">LeMori</h1>
            <p className="text-gray-500 italic text-sm">Lembrança e Memória</p>
          </div>

          <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nova senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="text-gray-600 mt-1 w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar nova senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
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
              {carregando ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}