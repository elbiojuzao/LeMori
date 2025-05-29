import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

export const mp = {
  payment: {
    get: async ({ id }: { id: string }) => {
      return await paymentClient.get({ id })
    }
  }
} as const