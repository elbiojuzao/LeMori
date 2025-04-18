import Head from 'next/head'
import Image from 'next/image'
import { GetServerSideProps } from 'next'
import mongooseConnect from '@/lib/mongoose'
import Homenagem, { IHomenagem } from '@/models/Homenagem'
import Footer from '@/components/Footer'
import { useState } from 'react'
import { useRouter } from 'next/router'

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
  const [showShareButtons, setShowShareButtons] = useState(false)
  const router = useRouter()
  const { asPath } = router
  const currentUrl = `${typeof window !== 'undefined' ? window.location.origin : 'SEU_DOMINIO'}${asPath}`
  const title = `Homenagem a ${homenagem.nomeHomenageado} | LeMori`
  const description = homenagem.biografia || `Veja a homenagem especial para ${homenagem.nomeHomenageado} no LeMori.`
  const imageUrl = homenagem.fotos?.[0] || `${typeof window !== 'undefined' ? window.location.origin : 'SEU_DOMINIO'}/img/avatar.png`

  const whatsappMessage = `${title} ${currentUrl}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(description)}`
  const instagramMessage = `Confira a homenagem a ${homenagem.nomeHomenageado}: ${currentUrl} (copie e cole no seu story ou bio!)`

  const shareToWhatsapp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`, '_blank')
  }

  const shareToFacebook = () => {
    window.open(facebookShareUrl, '_blank')
  }

  const shareToInstagram = () => {
    navigator.clipboard.writeText(instagramMessage)
    alert('Link copiado para a área de transferência. Cole no seu story ou bio do Instagram!')
  }

  const toggleShareButtons = () => {
    setShowShareButtons(!showShareButtons)
  }

  return (
    <>
      <Head>
        <title>{homenagem.nomeHomenageado} | LeMori</title>
        <meta name="description" content={description} />

        {/* Meta Tags Open Graph para Preview */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
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
            {/* Botão de Compartilhar Principal */}
            <div className="relative">
              <button onClick={toggleShareButtons} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-2 rounded">
                <Image src="/img/compartilhar.png" alt="Compartilhar" width={24} height={24} className="mr-4" />
              </button>
              {showShareButtons && (
                <div className="absolute top-full mt-2 bg-white shadow-md rounded-md overflow-hidden z-10">
                  <button onClick={shareToWhatsapp} className="block w-full text-left px-4 py-2 hover:bg-green-100 text-green-500 font-bold">
                    <Image src="/img/whatsapp.svg" alt="whatsapp" width={24} height={24} className="mr-4" />
                  </button>
                  <button onClick={shareToFacebook} className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-blue-500 font-bold">
                    <Image src="/img/facebook.svg" alt="facebook" width={24} height={24} className="mr-4" />
                  </button>
                  <button onClick={shareToInstagram} className="block w-full text-left px-4 py-2 hover:bg-purple-100 text-purple-500 font-bold">
                    <Image src="/img/Instagram.svg" alt="Instagram" width={24} height={24} className="mr-4" />
                  </button>
                </div>
              )}
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