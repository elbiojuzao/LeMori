import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Barra Lateral */}
      <aside className="bg-gray-800 text-white w-64 py-6 px-3 flex flex-col">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-xl font-bold hover:text-primary transition duration-200">
            Painel de Administração
          </Link>
        </div>
        <nav className="flex-grow">
          <ul>
            <li className="mb-2">
              <Link href="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/admin/homenagens" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                Homenagens
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/admin/usuarios" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                Usuários
              </Link>
            </li>
            <li>
              <Link href="/admin/cupons" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                Cupons
              </Link>
            </li>
            {/* Adicione mais links conforme necessário */}
          </ul>
        </nav>
        <div className="mt-8">
          <Link href="/" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
            Voltar ao Site
          </Link>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}