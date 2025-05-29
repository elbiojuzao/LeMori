import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

const config = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(config)

export const mp = {
  config,
  payment: {
    get: async ({ id }: { id: string }) => {
      return await paymentClient.get({ id })
    }
  },
  preference: new Preference(config)
} as const