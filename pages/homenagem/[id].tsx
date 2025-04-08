import Head from 'next/head'
import Image from 'next/image'
import { GetServerSideProps } from 'next'
import mongooseConnect from '@/lib/mongoose'
import Homenagem, { IHomenagem } from '@/models/Homenagem'
import Footer from '@/components/Footer'
import { useState } from 'react'

interface HomenagemProps {
  homenagem: {
    _id: string
    nomeHomenageado: string
    biografia?: string
    dataNascimento?: string | null
    dataFalecimento?: string | null
    fotos?: string[]
    musica?: string
  }
}

export default function HomenagemPage({ homenagem }: HomenagemProps) {
  const [abaAtiva, setAbaAtiva] = useState<'sobre' | 'fotos' | 'musica'>('sobre')

  return (
    <>
      <Head>
        <title>{homenagem.nomeHomenageado} | LeMori</title>
      </Head>

      <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-4xl">🌿</h1>
          <h1 className="text-4xl font-bold text-blue-500">LeMori</h1>
          <p className="text-gray-500 italic text-sm">Lembrança e Memória</p>
        </header>

        {/* Info principal */}
        <section className="px-6 py-4 bg-gray-100">
          <div className="max-w-3xl mx-auto flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <Image
                src={homenagem.fotos?.[0] || '/img/avatar.png'}
                alt="Avatar"
                width={100}
                height={100}
                className="rounded-full border-4 border-white shadow"
              />
              <div>
                <p className="text-sm text-gray-500">Em lembrança a</p>
                <h2 className="text-3xl font-bold">{homenagem.nomeHomenageado}</h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <span className="mr-2">†</span>
                  <span>{homenagem.dataFalecimento?.split('T')[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
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

        {/* Conteúdo das abas */}
        <div className="max-w-3xl mx-auto mt-6 px-4">
          {abaAtiva === 'sobre' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">{homenagem.nomeHomenageado}</h3>
              <p>{homenagem.biografia}</p>
            </div>
          )}

          {abaAtiva === 'fotos' && homenagem.fotos && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {homenagem.fotos.map((foto, idx) => (
                <Image
                  key={idx}
                  src={foto}
                  alt={`Foto ${idx + 1}`}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover w-full h-auto"
                />
              ))}
            </div>
          )}

          {abaAtiva === 'musica' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="mb-4">"Essa música representa a memória de {homenagem.nomeHomenageado}."</p>
              <audio controls className="w-full">
                <source src={homenagem.musica || '/musica.mp3'} type="audio/mpeg" />
                Seu navegador não suporta o player de áudio.
              </audio>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!

  await mongooseConnect()
  const homenagemDoc = await Homenagem.findById(id).lean<IHomenagem & { _id: string }>()

  if (!homenagemDoc) {
    return { notFound: true }
  }

  const homenagem = {
    _id: homenagemDoc._id.toString(),
    nomeHomenageado: homenagemDoc.nomeHomenageado,
    biografia: homenagemDoc.biografia || '',
    fotos: homenagemDoc.fotos || [],
    musica: homenagemDoc.musica || '',
    dataNascimento: homenagemDoc.dataNascimento
      ? new Date(homenagemDoc.dataNascimento).toISOString()
      : null,
    dataFalecimento: homenagemDoc.dataFalecimento
      ? new Date(homenagemDoc.dataFalecimento).toISOString()
      : null,
  }

  return {
    props: {
      homenagem,
    },
  }
}