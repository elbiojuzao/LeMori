import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import axios from 'axios'

export default function AdminCupons() {
  const [cupons, setCupons] = useState([])
  const [selectedCupom, setSelectedCupom] = useState(null)

  useEffect(() => {
    fetchCupons()
  }, [])

  async function fetchCupons() {
    try {
      const res = await axios.get('/api/cupom')
      setCupons(res.data)
    } catch (err) {
      console.error('Erro ao buscar cupons:', err)
    }
  }

  async function handleDelete(id) {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      try {
        await axios.delete(`/api/cupom/${id}`)
        fetchCupons()
      } catch (err) {
        console.error('Erro ao excluir cupom:', err)
      }
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gerenciar Cupons</h1>
        <button
          onClick={() => setSelectedCupom({})}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Novo Cupom
        </button>
      </div>

      {selectedCupom ? (
        <CupomForm
          cupom={selectedCupom}
          onCancel={() => setSelectedCupom(null)}
          onSave={() => {
            setSelectedCupom(null)
            fetchCupons()
          }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md text-gray-500">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Código</th>
                <th className="py-2 px-4 border-b">Desconto</th>
                <th className="py-2 px-4 border-b">Validade</th>
                <th className="py-2 px-4 border-b">Ativo</th>
                <th className="py-2 px-4 border-b">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cupons.map(cupom => (
                <tr key={cupom._id}>
                  <td className="py-2 px-4 border-b">{cupom.codigo}</td>
                  <td className="py-2 px-4 border-b">{cupom.desconto}%</td>
                  <td className="py-2 px-4 border-b">{new Date(cupom.validade).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">{cupom.ativo ? 'Sim' : 'Não'}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => setSelectedCupom(cupom)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cupom._id)}
                      className="text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}

// COMPONENTE DE FORMULÁRIO
function CupomForm({ cupom, onCancel, onSave }) {
  const [codigo, setCodigo] = useState(cupom.codigo || '')
  const [desconto, setDesconto] = useState(cupom.desconto || '')
  const [validade, setValidade] = useState(cupom.validade ? cupom.validade.slice(0,10) : '')
  const [ativo, setAtivo] = useState(cupom.ativo ?? true)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (cupom._id) {
        await axios.put(`/api/cupom/${cupom._id}`, { codigo, desconto, validade, ativo })
      } else {
        await axios.post('/api/cupom', { codigo, desconto, validade, ativo })
      }
      onSave()
    } catch (err) {
      console.error('Erro ao salvar cupom:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Código</label>
        <input
          type="text"
          className="w-full border-gray-300 rounded-lg text-gray-500"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Desconto (%)</label>
        <input
          type="number"
          className="w-full border-gray-300 rounded-lg text-gray-500"
          value={desconto}
          onChange={(e) => setDesconto(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Validade</label>
        <input
          type="date"
          className="w-full border-gray-300 rounded-lg text-gray-500"
          value={validade}
          onChange={(e) => setValidade(e.target.value)}
          required
        />
      </div>
      <div className="mb-6">
        <label className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
          />
          Ativo
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Salvar
        </button>
      </div>
    </form>
  )
}