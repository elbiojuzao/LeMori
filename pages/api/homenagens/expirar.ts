import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import Homenagem from '@/models/Homenagem'
import User from '@/models/User'
import { sendEmail } from '@/lib/mailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  try {
    const todas = await Homenagem.find({ foiNotificadoExpiracao: false }).populate('criadoPor')

    const expiradas = todas.filter((h) => {
      const expiracao = new Date(h.dataCriada)
      expiracao.setFullYear(expiracao.getFullYear() + 5)
      return new Date() > expiracao
    })

    for (const homenagem of expiradas) {
      const usuario = homenagem.criadoPor as any
      const email = usuario?.email
      if (!email) continue

      const linkRenovacao = `https://lemori.com/renovar/${homenagem._id}`

      const html = `
        <h2>Homenagem Expirada</h2>
        <p>A homenagem para <strong>${homenagem.nomeHomenageado}</strong> expirou.</p>
        <p>Para manter a página ativa, renove sua homenagem clicando abaixo:</p>
        <a href="${linkRenovacao}" style="padding:10px 15px; background-color:#4CAF50; color:white; text-decoration:none;">Renovar Homenagem</a>
      `

      await sendEmail(email, `Sua homenagem para ${homenagem.nomeHomenageado} expirou`, html)

      homenagem.foiNotificadoExpiracao = true
      await homenagem.save()
    }

    res.status(200).json({ expiradas: expiradas.length })
  } catch (error) {
    console.error('Erro ao processar expiração de homenagens:', error)
    res.status(500).json({ error: 'Erro interno' })
  }
}
