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
  const [homenagemCriadaId, setHomenagemCriadaId] = useState<string | null>(null)

  const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(null)
  const [fotosPreview, setFotosPreview] = useState<string[]>([])

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
          setFotoPerfilPreview(data.fotoPrincipal || '')
          setFotosPreview(data.galeria || [])
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

  const handleFotoPerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        compressImage(reader.result as string, 800, 800).then((compressed) => {
          setFotoPerfilPreview(compressed)
          setFotoPrincipal(compressed)
        })
      }
      reader.readAsDataURL(file)
    }
  }

  function compressImage(base64: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedData = canvas.toDataURL('image/jpeg', 0.7)
        resolve(compressedData)
      }
      img.src = base64
    })
  }

  const removerFotoPerfil = () => {
    const confirmar = confirm('Deseja realmente remover a foto principal?')
    if (confirmar) {
      setFotoPerfilPreview(null)
      setFotoPrincipal('')
    }
  }

  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (fotosPreview.length + files.length > 30) {
      setErroGaleria('Você só pode adicionar até 30 fotos.')
      return
    }

    const previews: string[] = []

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          compressImage(reader.result as string, 800, 800).then((compressed) => {
            previews.push(compressed)
            if (previews.length === files.length) {
              setFotosPreview((prev) => [...prev, ...previews])
            }
          })
        }
      }
      reader.readAsDataURL(file)
    })

    setErroGaleria('')
  }

  const removerFotoGaleria = (index: number) => {
    const confirmar = confirm('Deseja remover esta imagem da galeria?')
    if (confirmar) {
      setFotosPreview((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const validarFormulario = () => {
    if (!nome.trim()) {
      alert('O nome é obrigatório.')
      return false
    }

    if (nome.trim().length < 3) {
      alert('O nome deve conter pelo menos 3 caracteres.')
      return false
    }

    if (!nascimento) {
      alert('A data de nascimento é obrigatória.')
      return false
    }

    if (!falecimento) {
      alert('A data de falecimento é obrigatória.')
      return false
    }

    const nascimentoDate = new Date(nascimento)
    const falecimentoDate = new Date(falecimento)

    if (nascimentoDate > falecimentoDate) {
      alert('A data de nascimento não pode ser maior que a de falecimento.')
      return false
    }

    const diffAnos = (falecimentoDate.getTime() - nascimentoDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    if (diffAnos > 100) {
      const confirmar = confirm('A diferença entre as datas é maior que 100 anos. Tem certeza que está correto?')
      if (!confirmar) return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    if (!validarFormulario()) return

    try {
      const payload = {
        nomeHomenageado: nome,
        dataNascimento: nascimento,
        dataFalecimento: falecimento,
        biografia: biografia,
        musica: musica,
        fotoPrincipal: fotoPrincipal,
        galeria: fotosPreview,
      }

      let response
      if (modoEdicao) {
        await axios.put(`/api/homenagens/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMensagemSucesso('Homenagem atualizada com sucesso!')
      } else {
        response = await axios.post('/api/homenagens', payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        setMensagemSucesso('Homenagem criada com sucesso!')
        setHomenagemCriadaId(response.data._id)

        setNome('')
        setNascimento('')
        setFalecimento('')
        setBiografia('')
        setMusica('')
        setGaleriaFotos(null)
        setFotoPrincipal('')
        setFotosPreview([])
        setFotoPerfilPreview(null)
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

          {mensagemSucesso && !homenagemCriadaId && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-2 rounded mb-4">
              {mensagemSucesso}
            </div>
          )}

          {!homenagemCriadaId ? (
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
                  onChange={handleFotoPerfilChange}
                  className="w-full p-2 border rounded-md text-gray-600 file:text-gray-600 file:border-0 file:bg-transparent"
                />
                {fotoPerfilPreview && (
                  <div
                    className="relative mt-2 w-32 h-32 rounded-full overflow-hidden group cursor-pointer"
                    onClick={removerFotoPerfil}
                  >
                    <img
                      src={fotoPerfilPreview}
                      alt="Pré-visualização da foto de perfil"
                      className="w-full h-full object-cover group-hover:brightness-50"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xl opacity-0 group-hover:opacity-100">
                      ✖
                    </span>
                  </div>
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
                <label className="block mb-1 text-gray-600">Galeria de fotos (até 30 fotos)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFotosChange}
                  className="w-full p-2 border rounded-md text-gray-600 file:text-gray-600 file:border-0 file:bg-transparent"
                />
                {erroGaleria && <p className="text-red-600 text-sm mt-1">{erroGaleria}</p>}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {fotosPreview.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group w-24 h-24 rounded-md overflow-hidden cursor-pointer"
                    onClick={() => removerFotoGaleria(idx)}
                  >
                    <img
                      src={src}
                      alt={`Pré-visualização ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:brightness-50"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-2xl opacity-0 group-hover:opacity-100">
                      ✖
                    </span>
                  </div>
                ))}
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
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 p-2 rounded mb-4">
                {mensagemSucesso}
              </div>
              <button
                onClick={() => router.push(`/homenagem/${homenagemCriadaId}`)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold"
              >
                Ver Homenagem
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-semibold"
              >
                Início
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default withAuth(FormHomenagem)