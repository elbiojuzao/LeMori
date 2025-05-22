import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { Upload, Edit2 } from 'lucide-react'
import NextImage from 'next/image'
import withAuth from '@/lib/withAuth'
import moment from 'moment'
import 'moment/locale/pt-br'
import Logo from '@/components/Logo'
import Footer from '@/components/Footer'
import Head from 'next/head'
import Header from '@/components/Header'

interface HomenagemFormData {
  nome: string;
  dataNascimento: string;
  dataFalecimento: string;
  mensagem: string;
  fotos: File[];
  musica: string;
}

function FormHomenagem() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<HomenagemFormData>({
    nome: '',
    dataNascimento: '',
    dataFalecimento: '',
    mensagem: '',
    fotos: [],
    musica: ''
  })
  const [editandoCampo, setEditandoCampo] = useState<string | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<'sobre' | 'fotos' | 'musica'>('sobre')
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(null)
  const [fotosPreview, setFotosPreview] = useState<string[]>([])
  const [carregandoFotos, setCarregandoFotos] = useState(false)
  const [fotosCarregando, setFotosCarregando] = useState<number>(0)

  const carregarHomenagem = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/homenagens/${id}`)
      const data = await response.json()
      setFormData({
        nome: data.nome,
        dataNascimento: data.dataNascimento || '',
        dataFalecimento: data.dataFalecimento || '',
        mensagem: data.mensagem || '',
        fotos: [],
        musica: data.musica || ''
      })
      if (data.fotos) {
        setFotosPreview(data.fotos)
      }
      setFotoPerfilPreview(data.fotos?.[0] || '')
    } catch {
      toast.error('Erro ao carregar homenagem')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      carregarHomenagem()
    }
  }, [id, carregarHomenagem])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFotoPerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        compressImage(reader.result as string, 800, 800).then((compressed) => {
          setFotoPerfilPreview(compressed)
          setFormData(prev => ({ ...prev, fotos: [new File([compressed], file.name, { type: file.type })] }))
        })
      }
      reader.readAsDataURL(file)
    }
  }

  function compressImage(base64: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new window.Image()
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
      toast.error('Você só pode adicionar até 30 fotos.')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataEnvio = new FormData()
      formDataEnvio.append('nome', formData.nome)
      formDataEnvio.append('dataNascimento', formData.dataNascimento)
      formDataEnvio.append('dataFalecimento', formData.dataFalecimento)
      formDataEnvio.append('mensagem', formData.mensagem)
      formDataEnvio.append('musica', formData.musica)

      // Upload das fotos
      for (const file of formData.fotos) {
        formDataEnvio.append('fotos', file)
      }

      const response = await fetch(id ? `/api/homenagens/${id}` : '/api/homenagens', {
        method: id ? 'PUT' : 'POST',
        body: formDataEnvio
      })

      if (response.ok) {
        toast.success(id ? 'Homenagem atualizada com sucesso!' : 'Homenagem criada com sucesso!')
        router.push(id ? `/homenagem/${id}` : '/homenagem')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao salvar homenagem')
      }
    } catch (error) {
      console.error('Erro ao salvar homenagem:', error)
      toast.error('Erro ao salvar homenagem. Tente novamente.')
    } finally {
      setLoading(false)
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
        <title>{id ? 'Editar Homenagem' : 'Nova Homenagem'} | Lemori</title>
        <meta name="description" content={id ? 'Edite sua homenagem existente' : 'Crie uma nova homenagem em memória'} />
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
                    value={formData.nome}
                    onChange={handleInputChange}
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
                    {formData.nome || 'Nome do homenageado'}
                    <Edit2 size={20} className="ml-2 text-gray-400 group-hover:text-purple-600" />
                  </h2>
                )}
                <div className="flex flex-col text-gray-600 mt-1">
                  {editandoCampo === 'nascimento' ? (
                    <input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={handleInputChange}
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
                      {formatarData(formData.dataNascimento) || 'Data de nascimento'}
                      <Edit2 size={16} className="ml-2 group-hover:text-purple-600" />
                    </span>
                  )}
                  {editandoCampo === 'falecimento' ? (
                    <input
                      type="date"
                      value={formData.dataFalecimento}
                      onChange={handleInputChange}
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
                      {formatarData(formData.dataFalecimento) || 'Data de falecimento'}
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
              onClick={() => setAbaAtiva(aba as 'sobre' | 'fotos' | 'musica')}
            >
              {aba.charAt(0).toUpperCase() + aba.slice(1)}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-6 px-4">
          {abaAtiva === 'sobre' && (
            <div className="bg-white p-6 rounded-lg shadow">
              {editandoCampo === 'mensagem' ? (
                <textarea
                  value={formData.mensagem}
                  onChange={handleInputChange}
                  onBlur={() => setEditandoCampo(null)}
                  autoFocus
                  rows={6}
                  placeholder="Escreva a mensagem para o homenageado..."
                  className="w-full px-2 py-1 border-2 border-purple-500 rounded-md focus:outline-none"
                />
              ) : (
                <div 
                  onClick={() => setEditandoCampo('mensagem')}
                  className="cursor-pointer hover:text-purple-600 group"
                >
                  {formData.mensagem ? (
                    <p className="text-gray-700 whitespace-pre-line">{formData.mensagem}</p>
                  ) : (
                    <p className="text-gray-400 italic flex items-center">
                      Mensagem
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
                  <Upload size={48} className="mx-auto text-gray-400" />
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
              <p className="mb-4">&ldquo;Essa música representa a memória de {formData.nome || 'nome do homenageado'}.&rdquo;</p>
              {editandoCampo === 'musica' ? (
                <input
                  type="text"
                  value={formData.musica}
                  onChange={(e) => setFormData(prev => ({ ...prev, musica: e.target.value }))}
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
                  {formData.musica ? (
                    <p className="text-gray-700">{formData.musica}</p>
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
            disabled={loading}
            className={`w-full px-6 py-3 rounded-lg text-lg font-medium text-white flex items-center justify-center ${
              loading 
                ? 'bg-purple-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
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