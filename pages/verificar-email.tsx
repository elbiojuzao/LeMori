import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function VerificarEmail() {
  const router = useRouter()
  const { token } = router.query
  const [mensagem, setMensagem] = useState('Verificando seu e-mail...')
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (!token) return

    axios
      .get(`/api/verificar-email?token=${token}`)
      .then(res => {
        setMensagem(res.data.message)
        setErro(false)
      })
      .catch(err => {
        setMensagem(err.response?.data?.error || 'Erro ao verificar e-mail.')
        setErro(true)
      })
  }, [token])

  return (
    <>
    <Header/>
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-6 max-w-md text-center">
        <h1 className={`text-2xl font-bold mb-4 ${erro ? 'text-red-600' : 'text-green-600'}`}>
          {erro ? 'Erro' : 'Sucesso'}
        </h1>
        <p>{mensagem}</p>
      </div>
    </div>
    <Footer/>
    </>
  )
}