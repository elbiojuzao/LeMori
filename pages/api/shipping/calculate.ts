import { NextApiRequest, NextApiResponse } from 'next';

interface CartItem {
  weight: number;
  quantity: number;
  price: number;
  length: number;
  width: number;
  height: number;
}

interface ShippingOption {
  id: number;
  name: string;
  price: number;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { cep, items } = req.body as { cep: string; items: CartItem[] };

    if (!cep || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    // Simular um pequeno delay para parecer mais real
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calcular o peso total dos itens
    const totalWeight = items.reduce((sum: number, item: CartItem) => sum + (item.weight * item.quantity), 0);
    const totalValue = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

    // Mock das opções de frete
    const shippingOptions: ShippingOption[] = [
      {
        id: 41106,
        name: 'PAC',
        price: calculatePrice(totalWeight, totalValue, 'PAC'),
        delivery_time: 5,
        delivery_range: {
          min: 3,
          max: 7
        }
      },
      {
        id: 40010,
        name: 'SEDEX',
        price: calculatePrice(totalWeight, totalValue, 'SEDEX'),
        delivery_time: 3,
        delivery_range: {
          min: 1,
          max: 3
        }
      },
      {
        id: 40215,
        name: 'SEDEX 10',
        price: calculatePrice(totalWeight, totalValue, 'SEDEX10'),
        delivery_time: 1,
        delivery_range: {
          min: 1,
          max: 1
        }
      }
    ];

    return res.status(200).json({ shippingOptions });

  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    return res.status(500).json({ 
      message: 'Erro ao calcular frete. Por favor, tente novamente.' 
    });
  }
}

function calculatePrice(weight: number, value: number, service: string): number {
  // Preço base por kg
  const basePricePerKg = {
    'PAC': 5,
    'SEDEX': 10,
    'SEDEX10': 15
  };

  // Garantir que weight e value sejam números válidos
  weight = Number(weight) || 0;
  value = Number(value) || 0;

  // Calcular preço base
  let price = weight * (basePricePerKg[service as keyof typeof basePricePerKg] || 5);

  // Adicionar taxa de seguro (1% do valor do produto)
  price += value * 0.01;

  // Adicionar taxa fixa por serviço
  const fixedFee = {
    'PAC': 5,
    'SEDEX': 10,
    'SEDEX10': 15
  };
  price += fixedFee[service as keyof typeof fixedFee] || 5;

  // Garantir que o preço seja no mínimo 5 reais
  price = Math.max(5, price);

  // Arredondar para 2 casas decimais
  return Number(Math.round(price * 100) / 100);
}

// Funções auxiliares mantidas como fallback
function calculateDistance(cep1: string, cep2: string): number {
  const num1 = parseInt(cep1.replace(/\D/g, ''));
  const num2 = parseInt(cep2.replace(/\D/g, ''));
  return Math.abs(num1 - num2) / 1000;
}

function calculateDeliveryTime(distance: number, service: string): number {
  const baseTime = {
    'PAC': 5,
    'SEDEX': 3,
    'SEDEX10': 1
  };
  const extraDays = Math.floor(distance / 1000);
  return baseTime[service as keyof typeof baseTime] + extraDays;
}

function calculateShippingPrice(weight: number, value: number, service: string, distance: number): number {
  const basePricePerKg = {
    'PAC': 5,
    'SEDEX': 10,
    'SEDEX10': 15
  };

  weight = Number(weight) || 0;
  value = Number(value) || 0;

  let price = weight * (basePricePerKg[service as keyof typeof basePricePerKg] || 5);
  price += value * 0.01;

  const fixedFee = {
    'PAC': 5,
    'SEDEX': 10,
    'SEDEX10': 15
  };
  price += fixedFee[service as keyof typeof fixedFee] || 5;
  price += distance * 0.1;
  price = Math.max(5, price);

  return Number(Math.round(price * 100) / 100);
} 