import Head from 'next/head';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

interface CarrinhoItem {
  _id: string;
  nome: string;
  valor: number;
  quantidade: number;
}

export default function Checkout() {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      const carrinhoData = JSON.parse(carrinhoSalvo) as CarrinhoItem[];
      setCarrinho(carrinhoData);
      setTotal(carrinhoData.reduce((sum, item) => sum + item.valor * item.quantidade, 0));
    }
  }, []);

  const handlePagarMercadoPago = async () => {
    try {
      const response = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: carrinho, total }),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        console.error('Erro ao criar preferência:', data);
        alert('Ocorreu um erro ao iniciar o pagamento.');
      }
    } catch (error) {
      console.error('Erro ao comunicar com o backend:', error);
      alert('Ocorreu um erro ao iniciar o pagamento.');
    }
  };

  return (
    <>
      <Head>
        <title>Checkout</title>
      </Head>
      <Header />
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-blue-600 text-2xl font-bold mb-6">Checkout</h1>

        {carrinho.length > 0 ? (
          <div className="bg-white p-4 rounded-2xl shadow-md">
            <h2 className="text-gray-700 text-lg font-semibold mb-4">Resumo do Pedido</h2>
            <ul>
              {carrinho.map(item => (
                <li key={item._id} className="text-gray-500 flex justify-between items-center py-2 border-b">
                  <span>{item.nome} x {item.quantidade}</span>
                  <strong>R$ {(item.valor * item.quantidade).toFixed(2)}</strong>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-2 border-t">
              <strong className="text-xl text-green-600">Total: R$ {total.toFixed(2)}</strong>
            </div>

            <button
              onClick={handlePagarMercadoPago}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full mt-6 w-full"
            >
              Pagar com Mercado Pago
            </button>
          </div>
        ) : (
          <p className="text-gray-500">Seu carrinho está vazio.</p>
        )}
      </div>
    </>
  );
}