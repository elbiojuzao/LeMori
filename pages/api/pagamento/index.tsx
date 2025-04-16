import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Pagamento() {
  const [preferenceId, setPreferenceId] = useState<string | null>(null)

  useEffect(() => {
    initMercadoPago(process.env.MERCADO_PAGO_PUBLIC_KEY!, { locale: 'pt-BR' })

    const gerarPreferencia = async () => {
      const res = await axios.post('/api/pagamento/create', {
        title: 'Homenagem no LeMori',
        price: 300,
        quantity: 1,
        payer: {
          first_name: 'João',
          last_name: 'Silva',
          email: 'joao@email.com',
        }
      })
      setPreferenceId(res.data.preferenceId)
    }

    gerarPreferencia()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {preferenceId ? (
        <Wallet initialization={{ preferenceId }} />
      ) : (
        <p>Carregando botão de pagamento...</p>
      )}
    </div>
  )
}