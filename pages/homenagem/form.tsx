import { useEffect, useState } from 'react'
import NextImage from 'next/image'
import axios from 'axios'
import withAuth from '@/lib/withAuth'
import { useRouter } from 'next/router'
import { Save, Edit2, Plus } from 'lucide-react'
import moment from 'moment'
import 'moment/locale/pt-br'
import Logo from '@/components/Logo'
import Footer from '@/components/Footer'
import Head from 'next/head'
import Header from '@/components/Header'

function FormHomenagem() {
  const router = useRouter()
  const [homenagemId, setHomenagemId] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [falecimento, setFalecimento] = useState('')
  const [biografia, setBiografia] = useState('')
  const [fotoPrincipal, setFotoPrincipal] = useState<string>('')
  const [musica, setMusica] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editandoCampo, setEditandoCampo] = useState<string | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<'sobre' | 'fotos' | 'musica'>('sobre')
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(null)
  const [fotosPreview, setFotosPreview] = useState<string[]>([])
  const [carregandoFotos, setCarregandoFotos] = useState(false)
  const [fotosCarregando, setFotosCarregando] = useState<number>(0)

  useEffect(() => {
    if (router.query.id) {
      setHomenagemId(router.query.id as string)
    }
  }, [router.query])

  useEffect(() => {
    if (homenagemId) {
      const fetchData = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
          const res = await axios.get(`/api/homenagens/${homenagemId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = res.data
          setNome(data.nomeHomenageado || '')
          setNascimento(data.dataNascimento?.slice(0, 10) || '')
          setFalecimento(data.dataFalecimento?.slice(0, 10) || '')
          setBiografia(data.biografia || '')
          setMusica(data.musica || '')
          setFotoPrincipal(data.fotos?.[0] || '')
          setFotoPerfilPreview(data.fotos?.[0] || '')
          setFotosPreview(data.fotos || [])
        } catch (err: any) {
          if (err.response?.status === 403) {
            alert('Você não tem permissão para editar esta homenagem.')
            router.push('/perfil')
          } else {
            console.error('Erro ao carregar homenagem:', err)
          }
        }
      }

      fetchData()
    }
  }, [homenagemId])

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

  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (fotosPreview.length + files.length > 30) {
      alert('Você só pode adicionar até 30 fotos.')
      return
    }

    setCarregandoFotos(true)
    setFotosCarregando(files.length)
    const previews: string[] = []

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          compressImage(reader.result as string, 800, 800).then((compressed) => {
            previews.push(compressed)
            setFotosCarregando(prev => prev - 1)
            if (previews.length === files.length) {
              setFotosPreview((prev) => [...prev, ...previews])
              setCarregandoFotos(false)
            }
          })
        }
      }
      reader.readAsDataURL(file)
    })
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
    const dataAtual = new Date()

    if (nascimentoDate > dataAtual) {
      alert('A data de nascimento não pode ser maior que a data atual.')
      return false
    }

    if (falecimentoDate > dataAtual) {
      alert('A data de falecimento não pode ser maior que a data atual.')
      return false
    }

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
      setIsSaving(true)
      const formData = new FormData()
      
      formData.append('nomeHomenageado', nome)
      formData.append('dataNascimento', nascimento)
      formData.append('dataFalecimento', falecimento)
      formData.append('biografia', biografia)
      formData.append('musica', musica)

      if (fotoPrincipal) {
        const base64Data = fotoPrincipal.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteArrays = []
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512)
          const byteNumbers = new Array(slice.length)
          
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i)
          }
          
          const byteArray = new Uint8Array(byteNumbers)
          byteArrays.push(byteArray)
        }
        
        const blob = new Blob(byteArrays, { type: 'image/jpeg' })
        formData.append('fotoPrincipal', blob, 'fotoPrincipal.jpg')
      }

      if (fotosPreview.length > 0) {
        for (let i = 0; i < fotosPreview.length; i++) {
          const base64Data = fotosPreview[i].split(',')[1]
          const byteCharacters = atob(base64Data)
          const byteArrays = []
          
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512)
            const byteNumbers = new Array(slice.length)
            
            for (let j = 0; j < slice.length; j++) {
              byteNumbers[j] = slice.charCodeAt(j)
            }
            
            const byteArray = new Uint8Array(byteNumbers)
            byteArrays.push(byteArray)
          }
          
          const blob = new Blob(byteArrays, { type: 'image/jpeg' })
          formData.append('fotos', blob, `foto${i}.jpg`)
        }
      }

      let response
      if (homenagemId) {
        response = await axios.put(`/api/homenagens/${homenagemId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        })
        alert('Homenagem atualizada com sucesso!')
      } else {
        response = await axios.post('/api/homenagens', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        })
        alert('Homenagem criada com sucesso!')
        router.push(`/homenagem/${response.data._id}`)
      }
    } catch (error: any) {
      console.error('Erro ao salvar homenagem:', error)
      alert(error.response?.data?.error || 'Erro ao salvar homenagem')
    } finally {
      setIsSaving(false)
    }
  }

  const formatarData = (data: string | null | undefined) => {
    if (data) {
      return moment(data).locale('pt-br').format('DD/MM/YYYY')
    }
    return ''
  }

  return (
    <>
      <Head>
        <title>{homenagemId ? 'Editar Homenagem' : 'Nova Homenagem'} | Lemori</title>
        <meta name="description" content={homenagemId ? 'Edite sua homenagem existente' : 'Crie uma nova homenagem em memória'} />
      </Head>
      <Header />
      <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
        <div className='flex justify-center'>
          <Logo className="b-6 h-50"/>
        </div>

        <section className="px-6 py-4 bg-gray-100">
          <div className="max-w-3xl mx-auto flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoPerfilChange}
                  className="hidden"
                  id="fotoPrincipal"
                />
                <label
                  htmlFor="fotoPrincipal"
                  className="cursor-pointer group"
                >
                  <NextImage
                    src={fotoPerfilPreview || '/img/avatar.png'}
                    alt="Avatar"
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-white shadow group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={24} className="text-white bg-black bg-opacity-50 rounded-full p-2" />
                  </div>
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-500">Em lembrança a</p>
                {editandoCampo === 'nome' ? (
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    onBlur={() => setEditandoCampo(null)}
                    autoFocus
                    className="text-3xl font-bold border-b-2 border-purple-500 focus:outline-none bg-transparent"
                    placeholder="Nome do homenageado"
                  />
                ) : (
                  <h2 
                    onClick={() => setEditandoCampo('nome')}
                    className="text-3xl font-bold cursor-pointer hover:text-purple-600 flex items-center group"
                  >
                    {nome || 'Nome do homenageado'}
                    <Edit2 size={20} className="ml-2 text-gray-400 group-hover:text-purple-600" />
                  </h2>
                )}
                <div className="flex flex-col text-gray-600 mt-1">
                  {editandoCampo === 'nascimento' ? (
                    <input
                      type="date"
                      value={nascimento}
                      onChange={(e) => setNascimento(e.target.value)}
                      onBlur={() => setEditandoCampo(null)}
                      autoFocus
                      max={new Date().toISOString().split('T')[0]}
                      className="border-b-2 border-purple-500 focus:outline-none bg-transparent text-gray-500 text-sm w-36"
                    />
                  ) : (
                    <span 
                      onClick={() => setEditandoCampo('nascimento')}
                      className="cursor-pointer text-gray-400 hover:text-purple-600 flex items-center group mb-1"
                    >
                      {formatarData(nascimento) || 'Data de nascimento'}
                      <Edit2 size={16} className="ml-2 group-hover:text-purple-600" />
                    </span>
                  )}
                  {editandoCampo === 'falecimento' ? (
                    <input
                      type="date"
                      value={falecimento}
                      onChange={(e) => setFalecimento(e.target.value)}
                      onBlur={() => setEditandoCampo(null)}
                      autoFocus
                      max={new Date().toISOString().split('T')[0]}
                      className="border-b-2 text-gray-400 border-purple-500 focus:outline-none bg-transparent text-gray-500 text-sm w-36"
                    />
                  ) : (
                    <span 
                      onClick={() => setEditandoCampo('falecimento')}
                      className="cursor-pointer text-gray-400 hover:text-purple-600 flex items-center group"
                    >
                      <span className="mr-2">†</span>
                      {formatarData(falecimento) || 'Data de falecimento'}
                      <Edit2 size={16} className="ml-2 text-gray-400 group-hover:text-purple-600" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center space-x-2 mt-4">
          {['sobre', 'fotos', 'musica'].map((aba) => (
            <button
              key={aba}
              className={`px-4 py-2 rounded-md ${
                abaAtiva === aba ? 'bg-indigo-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setAbaAtiva(aba as any)}
            >
              {aba.charAt(0).toUpperCase() + aba.slice(1)}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-6 px-4">
          {abaAtiva === 'sobre' && (
            <div className="bg-white p-6 rounded-lg shadow">
              {editandoCampo === 'biografia' ? (
                <textarea
                  value={biografia}
                  onChange={(e) => setBiografia(e.target.value)}
                  onBlur={() => setEditandoCampo(null)}
                  autoFocus
                  rows={6}
                  placeholder="Escreva a biografia do homenageado..."
                  className="w-full px-2 py-1 border-2 border-purple-500 rounded-md focus:outline-none"
                />
              ) : (
                <div 
                  onClick={() => setEditandoCampo('biografia')}
                  className="cursor-pointer hover:text-purple-600 group"
                >
                  {biografia ? (
                    <p className="text-gray-700 whitespace-pre-line">{biografia}</p>
                  ) : (
                    <p className="text-gray-400 italic flex items-center">
                      Biografia
                      <Edit2 size={16} className="ml-2 text-gray-400 group-hover:text-purple-600" />
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {abaAtiva === 'fotos' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFotosChange}
                className="hidden"
                id="galeriaFotos"
              />
              <label
                htmlFor="galeriaFotos"
                className="aspect-w-3 aspect-h-2 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="text-center">
                  <Plus size={48} className="mx-auto text-gray-400" />
                  <span className="mt-2 block text-gray-600">Adicionar fotos</span>
                </div>
              </label>
              {carregandoFotos && (
                <div className="aspect-w-3 aspect-h-2 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <span className="mt-2 block text-gray-600">Carregando {fotosCarregando} foto{fotosCarregando !== 1 ? 's' : ''}...</span>
                  </div>
                </div>
              )}
              {fotosPreview.map((foto, idx) => (
                <div key={idx} className="relative group">
                  <NextImage
                    src={foto}
                    alt={`Foto ${idx + 1}`}
                    width={300}
                    height={200}
                    className="rounded-lg object-cover w-full h-auto"
                  />
                  <button
                    onClick={() => removerFotoGaleria(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {abaAtiva === 'musica' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="mb-4">"Essa música representa a memória de {nome || 'nome do homenageado'}."</p>
              {editandoCampo === 'musica' ? (
                <input
                  type="text"
                  value={musica}
                  onChange={(e) => setMusica(e.target.value)}
                  onBlur={() => setEditandoCampo(null)}
                  autoFocus
                  placeholder="Cole aqui o link da música (YouTube, Spotify, etc)"
                  className="w-full px-2 py-1 border-b-2 border-purple-500 focus:outline-none"
                />
              ) : (
                <div 
                  onClick={() => setEditandoCampo('musica')}
                  className="cursor-pointer hover:text-purple-600 flex items-center group"
                >
                  {musica ? (
                    <p className="text-gray-700">{musica}</p>
                  ) : (
                    <p className="text-gray-400 italic flex items-center">
                      Link da música
                      <Edit2 size={16} className="ml-2 text-gray-400 group-hover:text-purple-600" />
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto mt-8 px-4 mb-8">
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className={`w-full px-6 py-3 rounded-lg text-lg font-medium text-white flex items-center justify-center ${
              isSaving 
                ? 'bg-purple-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Salvar homenagem
              </>
            )}
          </button>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default withAuth(FormHomenagem)