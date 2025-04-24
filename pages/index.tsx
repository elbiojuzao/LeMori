import Head from 'next/head'
import Logo from '@/components/Logo'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>Lumenis - Sistema de Homenagens</title>
      </Head>
      <header className="bg-[#e4ddd6] py-6">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Logo className=' rounded-2xl h-2 h-20'/>
          <nav>
            <ul className="flex gap-6 text-[#333]">
              <li><a href="#como-funciona">Como Funciona</a></li>
              <li><a href="#depoimentos">Depoimentos</a></li>
              <li><a href="#contato">Contato</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="bg-[#d4ddd6] text-center py-20 px-4 text-[#333]">
        <h1 className="text-4xl font-bold mb-6 text-[#333]">Celebre Memórias com Homenagens Significativas</h1>
        <p className="text-lg mb-8 text-[#333]">Um espaço para expressar seu carinho e honrar aqueles que são importantes para você.</p>
        <a href="/register" className="inline-block bg-[#e4e3cd] text-[#333] py-3 px-6 rounded font-bold">
          Crie uma Homenagem
        </a>
      </section>

      <section id="como-funciona" className="bg-[#ececdd] text-center py-16 px-4">
        <h2 className="text-2xl font-bold mb-12 text-[#333]">Como Funciona</h2>
        <div className="flex flex-col md:flex-row justify-around gap-8 text-[#333]">
          {[
            { title: 'Escolha um Modelo', desc: 'Explore nossa variedade de modelos de homenagem.', icon: '🖼️' },
            { title: 'Personalize', desc: 'Adicione suas fotos, textos e lembranças.', icon: '✍️' },
            { title: 'Compartilhe', desc: 'Envie para amigos e familiares.', icon: '📤' },
          ].map((step, i) => (
            <div key={i} className="w-full md:w-1/3">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="depoimentos" className="bg-[#e4e3cd] text-center py-16 px-4 text-[#333]">
        <h2 className="text-2xl font-bold mb-8">Compartilhando Memórias</h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {[
            { text: '"Um espaço lindo para homenagear quem amamos."', author: 'Maria Silva' },
            { text: '"Facilidade e sensibilidade em um só lugar."', author: 'João Pereira' },
          ].map((depo, i) => (
            <div key={i} className="bg-white rounded shadow p-6">
              <p>{depo.text}</p>
              <p className="mt-4 text-sm italic text-gray-600">– {depo.author}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contato" className="bg-[#d4ddd6] text-center py-16 px-4 text-[#333]">
        <h2 className="text-2xl font-bold mb-6">Vamos Criar Juntos uma Linda Homenagem</h2>
        <form className="flex flex-col gap-4 max-w-md mx-auto mt-6">
          <input className="border border-gray-300 rounded px-4 py-2" type="text" placeholder="Seu Nome" />
          <input className="border border-gray-300 rounded px-4 py-2" type="email" placeholder="Seu Email" />
          <textarea className="border border-gray-300 rounded px-4 py-2" rows={4} placeholder="Sua Mensagem" />
          <button type="submit" className="bg-[#e4e3cd] text-[#333] py-3 rounded font-bold">Enviar Mensagem</button>
        </form>
      </section>

      <Footer />
    </>
  )
}