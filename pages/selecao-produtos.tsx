import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import { useRouter } from 'next/router';

interface Produto {
  _id: string;
  nome: string;
  descricao: string;
  valor: number;
}

interface CarrinhoItem extends Produto {
  quantidade: number;
}

export default function SelecaoProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Carregar carrinho do localStorage ao montar (se existir)
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    }
    
    axios.get('/api/produtos').then(res => {
      setProdutos(res.data);
    });
  }, []);

  const atualizarCarrinho = (produto: Produto, novaQtd: number) => {
    if (novaQtd < 0) return;

    setCarrinho(prev => {
      const existe = prev.find(p => p._id === produto._id);
      if (existe) {
        const novoCarrinho = prev.map(p =>
          p._id === produto._id ? { ...p, quantidade: novaQtd } : p
        );
        localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
        return novoCarrinho;
      } else if (novaQtd > 0) {
        const novoCarrinho = [...prev, { ...produto, quantidade: novaQtd }];
        localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
        return novoCarrinho;
      } else {
        const novoCarrinho = prev.filter(p => p._id !== produto._id);
        localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
        return novoCarrinho;
      }
    });
  };

  const total = carrinho.reduce((sum, item) => sum + item.valor * item.quantidade, 0);

  const handleFinalizarCompra = () => {
    router.push('/checkout');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-4 pb-32">
        <h1 className="text-blue-600 text-2xl font-bold mb-6">Selecione os produtos</h1>

        <div className="grid gap-4">
          {produtos.map(produto => {
            const itemCarrinho = carrinho.find(p => p._id === produto._id);
            const quantidade = itemCarrinho?.quantidade || 0;

            return (
              <div key={produto._id} className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-gray-600 text-lg font-semibold">{produto.nome}</h2>
                  <p className="text-gray-500">{produto.descricao}</p>
                  <p className="text-gray-600 font-bold mt-2">R$ {produto.valor.toFixed(2)}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <input
                    type="number"
                    min={0}
                    className="text-gray-600 w-20 text-center border rounded p-1"
                    value={quantidade}
                    onChange={(e) => atualizarCarrinho(produto, parseInt(e.target.value) || 0)}
                  />
                  <button
                    title="Adicionar ao carrinho"
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Barra fixa no final */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 border-t flex items-center justify-between z-50">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">Total da compra:</span>
            <strong className="text-xl text-green-600">R$ {total.toFixed(2)}</strong>
          </div>

          <div className="text-gray-600 flex items-center gap-2">
            <input
              type="text"
              placeholder="Cupom"
              className="text-gray-600 border rounded px-3 py-1"
            />
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleFinalizarCompra}
            >
              Finalizar compra
            </button>
          </div>
        </div>
      </div>
    </>
  );
}