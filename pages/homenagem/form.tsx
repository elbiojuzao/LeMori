import Head from 'next/head'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import axios from 'axios'
import withAuth from '@/lib/withAuth'
import { useRouter } from 'next/router'

function FormHomenagem() {
  const router = useRouter()
  const { id } = router.query

  const [nome, setNome] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [falecimento, setFalecimento] = useState('')
  const [biografia, setBiografia] = useState('')
  const [galeriaFotos, setGaleriaFotos] = useState<FileList | null>(null)
  const [erroGaleria, setErroGaleria] = useState('')
  const [fotoPrincipal, setFotoPrincipal] = useState<string>('')
  const [musica, setMusica] = useState('')
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [modoEdicao, setModoEdicao] = useState(false)

  useEffect(() => {
    if (id) {
      setModoEdicao(true)
      const fetchData = async () => {
        const token = localStorage.getItem('token')
        if (!token) return
  
        try {
          const res = await axios.get(`/api/homenagens/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = res.data
          setNome(data.nomeHomenageado || '')
          setNascimento(data.dataNascimento?.slice(0, 10) || '')
          setFalecimento(data.dataFalecimento?.slice(0, 10) || '')
          setBiografia(data.biografia || '')
          setMusica(data.musica || '')
          setFotoPrincipal(data.fotoPrincipal || '') 
        } catch (err: any) {
          if (err.response?.status === 403) {
            alert('Você não tem permissão para editar esta homenagem.')
            router.push('/dashboard')
          } else {
            console.error('Erro ao carregar homenagem:', err)
          }
        }
      }
  
      fetchData()
    }
  }, [id])  

  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 30) {
      setErroGaleria('Você pode selecionar no máximo 30 fotos.')
      e.target.value = ''
      setGaleriaFotos(null)
    } else {
      setErroGaleria('')
      setGaleriaFotos(files)
    }
  }

  const handleFotoPrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPrincipal(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const payload = {
        nomeHomenageado: nome,
        dataNascimento: nascimento,
        dataFalecimento: falecimento,
        biografia: biografia,
        musica: musica,
        fotoPrincipal: fotoPrincipal, 
      }

      if (modoEdicao) {
        await axios.put(`/api/homenagens/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMensagemSucesso('Homenagem atualizada com sucesso!')
      } else {
        await axios.post('/api/homenagens', payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        setMensagemSucesso('Homenagem criada com sucesso!')

        setNome('')
        setNascimento('')
        setFalecimento('')
        setBiografia('')
        setMusica('')
        setGaleriaFotos(null)
        setFotoPrincipal('')
      }
    } catch (error) {
      console.error('Erro ao salvar homenagem:', error)
    }
  }

  return (
    <>
      <Header />
      <Head>
        <title>{modoEdicao ? 'Editar' : 'Nova'} Homenagem | LeMori</title>
      </Head>

      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-blue-600 mb-6">
            {modoEdicao ? 'Editar homenagem' : 'Criar nova homenagem'}
          </h1>

          {mensagemSucesso && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-2 rounded mb-4">
              {mensagemSucesso}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 text-gray-600">Nome da pessoa homenageada</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-600"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block mb-1 text-gray-600">Data de nascimento</label>
                <input
                  type="date"
                  value={nascimento}
                  onChange={(e) => setNascimento(e.target.value)}
                  className="w-full p-2 border rounded-md text-gray-600"
                />
              </div>
              <div className="w-1/2">
                <label className="block mb-1 text-gray-600">Data de falecimento</label>
                <input
                  type="date"
                  value={falecimento}
                  onChange={(e) => setFalecimento(e.target.value)}
                  className="w-full p-2 border rounded-md text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Foto principal do homenageado</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoPrincipalChange}
                className="w-full p-2 border rounded-md text-gray-600 file:text-gray-600 file:border-0 file:bg-transparent"
              />
              {fotoPrincipal && (
                <img
                  src={fotoPrincipal}
                  alt="Pré-visualização"
                  className="mt-2 w-32 h-32 object-cover rounded-full shadow"
                />
              )}
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Mensagem de homenagem</label>
              <textarea
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-600"
                rows={4}
              ></textarea>
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Galeria de fotos (Até 30 fotos)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFotosChange}
                className="w-full p-2 border rounded-md text-gray-600 file:text-gray-600 file:border-0 file:bg-transparent"
              />
              {erroGaleria && <p className="text-red-600 text-sm mt-1">{erroGaleria}</p>}
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Link de música (YouTube, Spotify, etc)</label>
              <input
                type="url"
                value={musica}
                onChange={(e) => setMusica(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-600"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold w-full"
            >
              {modoEdicao ? 'Salvar alterações' : 'Criar homenagem'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default withAuth(FormHomenagem)