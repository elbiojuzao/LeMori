import Head from 'next/head'
import Image from 'next/image'
import { GetServerSideProps } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import Logo from '@/components/Logo'
import Footer from '@/components/Footer'
import { useState } from 'react'
import { useRouter } from 'next/router'
import moment from 'moment'
import 'moment/locale/pt-br'

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

  const handleShare = async () => {
    // Verifica se o dispositivo suporta a Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: currentUrl
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    } else {
      // Se não suportar, mostra o menu dropdown (desktop)
      setShowShareButtons(!showShareButtons)
    }
  }

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

  const formatarData = (data: string | null | undefined) => {
    if (data) {
      return moment(data).locale('pt-br').format('DD/MM/YYYY')
    }
    return ''
  }

  function getSpotifyTrackId(url: string) {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }
  
  function getYouTubeVideoId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  return (
    <>
      <Head>
        <title>Em memória de {homenagem.nomeHomenageado} | Lemori</title>
        <meta name="description" content={`Homenagem em memória de ${homenagem.nomeHomenageado}. ${homenagem.biografia?.substring(0, 150)}...`} />
      </Head>
      <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
        {/* Header */}
        <div className='flex justify-center'>
          <Logo className="b-6 h-50"/>
        </div>

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
                  <span>{formatarData(homenagem.dataFalecimento)}</span>
                </div>
              </div>
            </div>
            {/* Botão de Compartilhar Principal */}
            <div className="relative">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
              {showShareButtons && !navigator.share && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-100">
                  <button 
                    onClick={shareToWhatsapp} 
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button 
                    onClick={shareToFacebook} 
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  <button 
                    onClick={shareToInstagram} 
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    Instagram
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
              {homenagem.musica?.includes('spotify.com') ? (
                <iframe
                  src={`https://open.spotify.com/embed/track/${getSpotifyTrackId(homenagem.musica)}`}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              ) : homenagem.musica?.includes('youtube.com') ? (
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(homenagem.musica)}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              ) : (
                <audio controls className="w-full">
                  <source src={homenagem.musica || '/musica.mp3'} type="audio/mpeg" />
                  Seu navegador não suporta o player de áudio.
                </audio>
              )}
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

  try {
    const { db } = await connectToDatabase()
    
    const homenagemDoc = await db.collection('homenagem').findOne({
      _id: new ObjectId(id as string),
      excluida: { $ne: true }
    })

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
  } catch (error) {
    console.error('Erro ao buscar homenagem:', error)
    return { notFound: true }
  }
}