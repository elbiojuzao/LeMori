import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import axios from 'axios'
import { Eye } from 'lucide-react'

export default function TelaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [filtros, setFiltros] = useState({ nome: '', nascimento: '', criacao: '', homenagens: '' })
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  async function fetchUsuarios() {
    try {
      const res = await axios.get('/api/users')
      setUsuarios(res.data)
    } catch (err) {
      console.error('Erro ao buscar usuários:', err)
    }
  }

  const usuariosFiltrados = usuarios.filter(u => {
    return (
      u.nome.toLowerCase().includes(filtros.nome.toLowerCase()) &&
      (filtros.nascimento === '' || u.dataNascimento?.startsWith(filtros.nascimento)) &&
      (filtros.criacao === '' || u.createdAt?.startsWith(filtros.criacao)) &&
      (filtros.homenagens === '' || (u.totalHomenagens || 0) >= parseInt(filtros.homenagens))
    )
  })

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Usuários Cadastrados</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          placeholder="Filtrar por nome"
          className="border p-2 rounded text-gray-800"
          value={filtros.nome}
          onChange={e => setFiltros({ ...filtros, nome: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded text-gray-800"
          value={filtros.nascimento}
          onChange={e => setFiltros({ ...filtros, nascimento: e.target.value })}
          placeholder="Data nascimento"
        />
        <input
          type="date"
          className="border p-2 rounded text-gray-800"
          value={filtros.criacao}
          onChange={e => setFiltros({ ...filtros, criacao: e.target.value })}
          placeholder="Data criação"
        />
        <input
          type="number"
          className="border p-2 rounded text-gray-800"
          placeholder="Mínimo homenagens"
          value={filtros.homenagens}
          onChange={e => setFiltros({ ...filtros, homenagens: e.target.value })}
        />
      </div>

      {/* Tabela de usuários */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow text-gray-600">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">E-mail</th>
              <th className="py-2 px-4 border-b">Data Nasc.</th>
              <th className="py-2 px-4 border-b">Criado em</th>
              <th className="py-2 px-4 border-b">Homenagens</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(u => (
              <tr key={u._id} className="text-center">
                <td className="py-2 px-4 border-b">{u.nome}</td>
                <td className="py-2 px-4 border-b">{u.email}</td>
                <td className="py-2 px-4 border-b">{u.dataNascimento ? new Date(u.dataNascimento).toLocaleDateString() : '-'}</td>
                <td className="py-2 px-4 border-b">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{u.totalHomenagens || 0}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => setUsuarioSelecionado(u)}
                    className="text-blue-600 hover:underline"
                    title="Visualizar"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalhes */}
      {usuarioSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl relative">
            <button onClick={() => setUsuarioSelecionado(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Detalhes do Usuário</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Nome:</strong> {usuarioSelecionado.nome}</p>
              <p><strong>E-mail:</strong> {usuarioSelecionado.email}</p>
              <p><strong>CPF:</strong> {usuarioSelecionado.cpf ? '***.***.***-**' + usuarioSelecionado.cpf.slice(-2) : 'Usuário não cadastrou CPF'}</p>
              <p><strong>Data de nascimento:</strong> {usuarioSelecionado.dataNascimento ? new Date(usuarioSelecionado.dataNascimento).toLocaleDateString() : '-'}</p>
              <p><strong>Endereço:</strong> {usuarioSelecionado.endereco || '-'}</p>
              <p><strong>Data de cadastro:</strong> {new Date(usuarioSelecionado.createdAt).toLocaleString()}</p>
              <p><strong>Último login:</strong> {usuarioSelecionado.ultimoLogin ? new Date(usuarioSelecionado.ultimoLogin).toLocaleString() : '-'}</p>
              <p><strong>Homenagens criadas:</strong> {usuarioSelecionado.totalHomenagens || 0}</p>
              <p><strong>Última homenagem:</strong> {usuarioSelecionado.ultimaHomenagem || '-'}</p>
              <p><strong>Status da conta:</strong> {usuarioSelecionado.ativo ? 'Ativa' : 'Inativa'}</p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}