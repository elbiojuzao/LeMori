import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import axios from 'axios'
import { Eye } from 'lucide-react'

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [filtros, setFiltros] = useState({
    search: '',
    statusPagamento: '',
    tipoProduto: '',
    dataInicio: '',
    dataFim: '',
    ordenacao: 'desc'
  })
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)

  useEffect(() => {
    buscarPedidos()
  }, [filtros])

  async function buscarPedidos() {
    try {
      const res = await axios.get('/api/pedidos', { params: filtros })
      setPedidos(res.data)
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Pedidos</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          placeholder="Buscar por ID ou Nome"
          className="border p-2 rounded text-gray-800"
          value={filtros.search}
          onChange={e => setFiltros({ ...filtros, search: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded text-gray-800"
          value={filtros.dataInicio}
          onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded text-gray-800"
          value={filtros.dataFim}
          onChange={e => setFiltros({ ...filtros, dataFim: e.target.value })}
        />
        <select
          className="border p-2 rounded text-gray-800"
          value={filtros.statusPagamento}
          onChange={e => setFiltros({ ...filtros, statusPagamento: e.target.value })}
        >
          <option value="">Todos os Status</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Tabela de pedidos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow text-gray-600">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Usuário</th>
              <th className="py-2 px-4 border-b">Data</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Valor Total</th>
              <th className="py-2 px-4 border-b">Produto Físico</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(pedido => (
              <tr key={pedido._id} className="text-center">
                <td className="py-2 px-4 border-b">{pedido._id.slice(-6)}</td>
                <td className="py-2 px-4 border-b">{pedido.user?.nome || pedido.userId}</td>
                <td className="py-2 px-4 border-b">{new Date(pedido.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    pedido.statusPagamento === 'pago' ? 'bg-green-100 text-green-800' :
                    pedido.statusPagamento === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {pedido.statusPagamento}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">R$ {pedido.valorTotal.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{pedido.itensFisico ? 'Sim' : 'Não'}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => setPedidoSelecionado(pedido)}
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
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
            <button 
              onClick={() => setPedidoSelecionado(null)} 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Detalhes do Pedido</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Informações do Pedido</h3>
                <p><strong>ID:</strong> {pedidoSelecionado._id}</p>
                <p><strong>Data:</strong> {new Date(pedidoSelecionado.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    pedidoSelecionado.statusPagamento === 'pago' ? 'bg-green-100 text-green-800' :
                    pedidoSelecionado.statusPagamento === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {pedidoSelecionado.statusPagamento}
                  </span>
                </p>
                <p><strong>Valor Total:</strong> R$ {pedidoSelecionado.valorTotal.toFixed(2)}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Informações do Usuário</h3>
                <p><strong>Nome:</strong> {pedidoSelecionado.user?.nome || 'N/A'}</p>
                <p><strong>Email:</strong> {pedidoSelecionado.user?.email || 'N/A'}</p>
                <p><strong>CPF:</strong> {pedidoSelecionado.user?.cpf ? '***.***.***-' + pedidoSelecionado.user.cpf.slice(-2) : 'N/A'}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Informações de Entrega</h3>
              <p><strong>Destinatário:</strong> {pedidoSelecionado.endereco.destinatario || pedidoSelecionado.user?.nome}</p>
              <p><strong>Telefone:</strong> {pedidoSelecionado.endereco.telefone || pedidoSelecionado.user?.telefone || 'N/A'}</p>
              <p><strong>Endereço:</strong> {`
                ${pedidoSelecionado.endereco.rua}, ${pedidoSelecionado.endereco.numero}
                ${pedidoSelecionado.endereco.complemento ? ' - ' + pedidoSelecionado.endereco.complemento : ''}
                - ${pedidoSelecionado.endereco.bairro}, ${pedidoSelecionado.endereco.cidade}/${pedidoSelecionado.endereco.estado}
                - CEP: ${pedidoSelecionado.endereco.cep}
              `}</p>
              {pedidoSelecionado.frete && (
                <div className="mt-2">
                  <p><strong>Frete:</strong> R$ {pedidoSelecionado.frete.valor.toFixed(2)}</p>
                  {pedidoSelecionado.frete.codigoRastreio && (
                    <p><strong>Código de Rastreio:</strong> {pedidoSelecionado.frete.codigoRastreio}</p>
                  )}
                </div>
              )}
            </div>

            {pedidoSelecionado.cupomAplicado && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Cupom Aplicado</h3>
                <p><strong>Código:</strong> {pedidoSelecionado.cupomAplicado.codigo}</p>
                <p><strong>Desconto:</strong> R$ {pedidoSelecionado.cupomAplicado.desconto.toFixed(2)}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Itens do Pedido</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Produto</th>
                      <th className="px-4 py-2 text-left">Tipo</th>
                      <th className="px-4 py-2 text-left">Quantidade</th>
                      <th className="px-4 py-2 text-left">Preço Unitário</th>
                      <th className="px-4 py-2 text-left">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoSelecionado.itens?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.nome}</td>
                        <td className="px-4 py-2">{item.tipo}</td>
                        <td className="px-4 py-2">{item.quantidade}</td>
                        <td className="px-4 py-2">R$ {item.preco.toFixed(2)}</td>
                        <td className="px-4 py-2">R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}