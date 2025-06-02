interface ShippingProduct {
  weight: number; // em KG
  width: number;  // em CM
  height: number;
  length: number;
  insurance_value: number;
  quantity: number;
}

interface ShippingRequest {
  accessToken: string;
  from: { cep: string };
  to: { cep: string };
  products: ShippingProduct[];
}

const calculateShipping = async ({
  accessToken,
  from,
  to,
  products,
}: ShippingRequest) => {
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new Error('Nenhum produto fornecido para cálculo de frete');
  }

  const services = ['1', '2', '3', '4']; // Correios PAC, Correios SEDEX, Jadlog, Azul

  const packages = products.map((product) => ({
    weight: product.weight,
    width: product.width,
    height: product.height,
    length: product.length,
    insurance_value: product.insurance_value,
    quantity: product.quantity,
  }));

  const response = await fetch('https://api.melhorenvio.com.br/api/v2/me/shipment/calculate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      from: { postal_code: from.cep },
      to: { postal_code: to.cep },
      products: packages,
      services,
      options: {
        insurance_value: packages.reduce((acc, pkg) => acc + (pkg.insurance_value * pkg.quantity), 0),
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false,
        invoice: {
          key: "",
        },
        platform: "Lemori",
        tags: [
          {
            tag: "Aviso de Recebimento",
            url: process.env.NEXT_PUBLIC_APP_URL
          }
        ]
      }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao calcular o frete');
  }

  return await response.json();
};

export default calculateShipping; 