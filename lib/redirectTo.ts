import { NextRouter } from 'next/router'

export function redirectToAfterLogin(router: NextRouter, fallback: string = '/perfil') {
  const redirect = router.query.redirect
  const destino = typeof redirect === 'string' ? redirect : fallback
  router.push(destino)
}

export function replaceToAfterLogin(router: NextRouter, fallback: string = '/perfil') {
  const redirect = router.query.redirect
  const destino = typeof redirect === 'string' ? redirect : fallback
  router.replace(destino)
}