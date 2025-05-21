import Link from 'next/link'
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Sobre a Lumenis</h3>
            <p className="text-sm">
              Somos especializados em presentes personalizados e artesanais,
              criando momentos especiais através de produtos únicos e memoráveis.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-sm hover:text-purple-400">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-purple-400">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-purple-400">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-purple-400">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-purple-400">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-2" />
                (41) 99999-9999
              </li>
              <li className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-2" />
                contato@lumenis.com.br
              </li>
              <li className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                Cidade Digital, PR
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Redes Sociais</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-purple-400"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-purple-400"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-purple-400"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Lumenis. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
} 