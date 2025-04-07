import Head from 'next/head'

export default function Login() {
  return (
    <>
      <Head>
        <title>Login | LeMori</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          {/* Logo e título */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl">🌿</h1>
            <h1 className="text-4xl font-bold text-blue-500">LeMori</h1>
            <p className="text-gray-500 italic text-sm">Lembrança e Memória</p>
          </div>
          {/* Formulário */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="text-gray-600 mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="seuemail@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input
                type="password"
                className="text-gray-600 mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <a href="/#" className="text-sm text-blue-500 hover:underline">
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Entrar
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Ainda não tem uma conta?{' '}
            <a href="register" className="text-purple-600 hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
