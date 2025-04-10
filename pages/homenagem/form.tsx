import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function HomenagemForm() {
  const router = useRouter()
  const { id } = router.query

  const [form, setForm] = useState({
    nomeHomenageado: '',
    biografia: '',
    fotos: '',
    musica: '',
    dataNascimento: '',
    dataFalecimento: ''
  })

  const [loading, setLoading] = useState(false)

  // Carrega dados se estiver em modo de edição
  useEffect(() => {
    const fetchHomenagem = async () => {
      if (id) {
        const res = await fetch(`/api/homenagens/${id}`)
        const data = await res.json()
        setForm({
          nomeHomenageado: data.nomeHomenageado || '',
          biografia: data.biografia || '',
          fotos: data.fotos || '',
          musica: data.musica || '',
          dataNascimento: data.dataNascimento?.split('T')[0] || '',
          dataFalecimento: data.dataFalecimento?.split('T')[0] || ''
        })
      }
    }

    fetchHomenagem()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('token')
    const method = id ? 'PUT' : 'POST'
    const endpoint = id ? `/api/homenagens/${id}` : '/api/homenagens'

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      console.error('Erro ao salvar homenagem')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {id ? 'Editar Homenagem' : 'Nova Homenagem'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nomeHomenageado"
          placeholder="Nome do Homenageado"
          value={form.nomeHomenageado}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <textarea
          name="biografia"
          placeholder="Biografia"
          value={form.biografia}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          rows={4}
        />
        <input
          type="text"
          name="fotos"
          placeholder="Link da foto"
          value={form.fotos}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="musica"
          placeholder="Link da música"
          value={form.musica}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="dataNascimento"
          value={form.dataNascimento}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="dataFalecimento"
          value={form.dataFalecimento}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Salvando...' : id ? 'Salvar Alterações' : 'Criar Homenagem'}
        </button>
      </form>
    </div>
  )
}