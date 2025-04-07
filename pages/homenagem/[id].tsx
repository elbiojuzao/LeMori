import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { Share2Icon } from 'lucide-react'

export default function HomenagemPage() {
  const [abaAtiva, setAbaAtiva] = useState<'sobre' | 'fotos' | 'musica'>('sobre')

  return (
    <>
      <Head>
        <title>Homenagem | LeMori</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 text-gray-800">
        {/* Header */}
        <header className="mb-6 text-center">
          {/* Logo e título */}
          <h1 className="text-4xl">🌿</h1>
          <h1 className="text-4xl font-bold text-blue-500">LeMori</h1>
          <p className="text-gray-500 italic text-sm">Lembrança e Memória</p>
        </header>

        {/* Info principal */}
        <section className="px-6 py-4 bg-gray-100">
          <div className="max-w-3xl mx-auto flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <Image
                src="/img/avatar.png"
                alt="Avatar"
                width={100}
                height={100}
                className="rounded-full border-4 border-white shadow"
              />
              <div>
                <p className="text-sm text-gray-500">Em lembrança a</p>
                <h2 className="text-3xl font-bold">Marcos Junior</h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <span className="mr-2">†</span>
                  <span>06/04/2024</span>
                </div>
              </div>
            </div>

            <button className="p-2 rounded-full hover:bg-gray-200 transition">
              <Share2Icon size={20} />
            </button>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex justify-center space-x-2 mt-4">
          <button
            className={`px-4 py-2 rounded-md ${
              abaAtiva === 'sobre' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setAbaAtiva('sobre')}
          >
            Sobre
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              abaAtiva === 'fotos' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setAbaAtiva('fotos')}
          >
            Fotos
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              abaAtiva === 'musica' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setAbaAtiva('musica')}
          >
            Música
          </button>
        </div>

        {/* Conteúdo das abas */}
        <div className="max-w-3xl mx-auto mt-6 px-4">
          {abaAtiva === 'sobre' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">Marcos Junior</h3>
              <p>
                Marcos Junior foi um cunhado gente fina bebum exemplar da nossa família. Com paixão por cachassa e um coração generoso, ele marcou todos que o conheceram.
              </p>
            </div>
          )}

          {abaAtiva === 'fotos' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <Image
                  key={num}
                  src={`/img/${num}.jpg`}
                  alt={`Foto ${num}`}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover w-full h-auto"
                />
              ))}
            </div>
          )}

          {abaAtiva === 'musica' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="mb-4">"Essa música representa a memória de Marcos Junior."</p>
              <audio controls className="w-full">
                <source src="/musica.mp3" type="audio/mpeg" />
                Seu navegador não suporta o player de áudio.
              </audio>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <footer className="mt-12 py-6 bg-indigo-300 text-center text-white text-sm">
          © 2025 Equipe de LeMori. Todos os direitos reservados.
        </footer>
      </div>
    </>
  )
}
