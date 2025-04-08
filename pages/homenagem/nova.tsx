import Head from 'next/head'
import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import axios from 'axios'

export default function NovaHomenagem() {
  const [nome, setNome] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [falecimento, setFalecimento] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [galeriaFotos, setGaleriaFotos] = useState<FileList | null>(null)
  const [erroGaleria, setErroGaleria] = useState<string>('')
  const [musicaLink, setMusicaLink] = useState('')
  const [musicaArquivo, setMusicaArquivo] = useState<File | null>(null)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    try {
      const payload = {
        nome,
        nascimento,
        falecimento,
        mensagem,
        musicaLink
      }
  
      const response = await axios.post('/api/homenagem', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
  
      setMensagemSucesso('Homenagem criada com sucesso!')
      console.log(response.data)
  
      // Resetar formulário
      setNome('')
      setNascimento('')
      setFalecimento('')
      setMensagem('')
      setMusicaLink('')
  
    } catch (error) {
      console.error('Erro ao criar homenagem:', error)
    }
  }
  

  return (
    <>
      <Header />
      <Head>
        <title>Nova Homenagem | LeMori</title>
      </Head>

      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-blue-600 mb-6">Criar nova homenagem</h1>

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
              <label className="block mb-1 text-gray-600">Mensagem de homenagem</label>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
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
                value={musicaLink}
                onChange={(e) => setMusicaLink(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-600"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Ou envie um arquivo de música</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setMusicaArquivo(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded-md text-gray-600"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold w-full"
            >
              Criar homenagem
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
