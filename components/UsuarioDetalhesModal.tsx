import React from 'react';
import { User } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pedido {
  _id: string;
  dataCompra: string;
  statusPagamento: string;
  statusPedido: string;
  valorTotal: number;
}

interface Homenagem {
  _id: string;
  nomeHomenageado: string;
  dataCriacao: string;
  ativo: boolean;
}

interface Depoimento {
  _id: string;
  depoimento: string;
  status: string;
  dataCriacao: string;
}

interface UsuarioDetalhado {
  _id: string;
  nome: string;
  email: string;
  cpf?: string;
  dataNascimento?: string;
  createdAt: string;
  quantidadeHomenagens: number;
  statusConta: 'ativo' | 'inativo';
  isAdmin: boolean;
  foto?: string;
  homenagemCreditos?: number;
  emailVerificado?: boolean;
  ultimoLogin?: string;
  ultimaHomenagem?: string;
  pedidos?: Pedido[];
  homenagens?: Homenagem[];
  depoimentos?: Depoimento[];
}

interface UsuarioDetalhesModalProps {
  usuarioSelecionado: UsuarioDetalhado | null;
  modalAberta: boolean;
  setModalAberta: (open: boolean) => void;
  carregandoDetalhes: boolean;
}

const UsuarioDetalhesModal: React.FC<UsuarioDetalhesModalProps> = ({
  usuarioSelecionado,
  modalAberta,
  setModalAberta,
  carregandoDetalhes,
}) => {
  if (!modalAberta || !usuarioSelecionado) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Detalhes do Usuário</h2>
            <button
              onClick={() => setModalAberta(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          {carregandoDetalhes ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informações Pessoais */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-4">
                    {usuarioSelecionado.foto ? (
                      <Image
                        src={usuarioSelecionado.foto}
                        alt={usuarioSelecionado.nome}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{usuarioSelecionado.nome}</p>
                      <p className="text-sm text-gray-600">{usuarioSelecionado.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700"><span className="font-medium">CPF:</span> {usuarioSelecionado.cpf || 'Não informado'}</p>
                    <p className="text-gray-700"><span className="font-medium">Data de Nascimento:</span> {usuarioSelecionado.dataNascimento && !isNaN(new Date(usuarioSelecionado.dataNascimento).getTime())
                      ? format(new Date(usuarioSelecionado.dataNascimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : 'Não informada'}</p>
                    <p className="text-gray-700"><span className="font-medium">Status:</span> <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${usuarioSelecionado.statusConta === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{usuarioSelecionado.statusConta === 'ativo' ? 'Ativo' : 'Inativo'}</span></p>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Estatísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Homenagens</p>
                    <p className="text-2xl font-bold text-gray-800">{usuarioSelecionado.quantidadeHomenagens}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Créditos</p>
                    <p className="text-2xl font-bold text-gray-800">{usuarioSelecionado.homenagemCreditos || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Pedidos</p>
                    <p className="text-2xl font-bold text-gray-800">{usuarioSelecionado.pedidos?.length || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Depoimentos</p>
                    <p className="text-2xl font-bold text-gray-800">{usuarioSelecionado.depoimentos?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Pedidos */}
              {usuarioSelecionado.pedidos && usuarioSelecionado.pedidos.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Pedidos</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Data</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usuarioSelecionado.pedidos.map((pedido) => (
                          <tr key={pedido._id}>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {pedido.dataCompra && !isNaN(new Date(pedido.dataCompra).getTime())
                                ? format(new Date(pedido.dataCompra), "dd/MM/yyyy")
                                : 'Data não disponível'}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                pedido.statusPedido === 'entregue' ? 'bg-green-100 text-green-800' :
                                pedido.statusPedido === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {pedido.statusPedido}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              R$ {pedido.valorTotal.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Homenagens */}
              {usuarioSelecionado.homenagens && usuarioSelecionado.homenagens.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Homenagens</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Homenageado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Data</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usuarioSelecionado.homenagens.map((homenagem) => (
                          <tr key={homenagem._id}>
                            <td className="px-4 py-2 text-sm text-gray-700">{homenagem.nomeHomenageado}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {homenagem.dataCriacao && !isNaN(new Date(homenagem.dataCriacao).getTime())
                                ? format(new Date(homenagem.dataCriacao), "dd/MM/yyyy")
                                : 'Data não disponível'}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                homenagem.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {homenagem.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Depoimentos */}
              {usuarioSelecionado.depoimentos && usuarioSelecionado.depoimentos.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Depoimentos</h3>
                  <div className="space-y-4">
                    {usuarioSelecionado.depoimentos.map((depoimento) => (
                      <div key={depoimento._id} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            depoimento.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                            depoimento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {depoimento.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {depoimento.dataCriacao && !isNaN(new Date(depoimento.dataCriacao).getTime())
                              ? format(new Date(depoimento.dataCriacao), "dd/MM/yyyy")
                              : 'Data não disponível'}
                          </span>
                        </div>
                        <p className="text-gray-700">{depoimento.depoimento}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuarioDetalhesModal; 