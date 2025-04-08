// pages/homenagens/nova.tsx
import Head from 'next/head'
import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NovaHomenagem() {
  const [galeriaFotos, setGaleriaFotos] = useState<FileList | null>(null)
  const [erroGaleria, setErroGaleria] = useState<string>('')

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

  return (
    <>
      <Header />
      <Head>
        <title>Nova Homenagem | LeMori</title>
      </Head>

      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-blue-600 mb-6">Criar nova homenagem</h1>

          <form className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-600">Nome da pessoa homenageada</label>
              <input type="text" className="w-full p-2 border rounded-md text-gray-600" />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block mb-1 text-gray-600">Data de nascimento</label>
                <input type="date" className="w-full p-2 border rounded-md text-gray-600" />
              </div>
              <div className="w-1/2">
                <label className="block mb-1 text-gray-600">Data de falecimento</label>
                <input type="date" className="w-full p-2 border rounded-md text-gray-600" />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Mensagem de homenagem</label>
              <textarea className="w-full p-2 border rounded-md text-gray-600" rows={4}></textarea>
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
              <input type="url" className="w-full p-2 border rounded-md text-gray-600" placeholder="https://..." />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Ou envie um arquivo de música</label>
              <input type="file" accept="audio/*" className="w-full p-2 border rounded-md text-gray-600" />
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
