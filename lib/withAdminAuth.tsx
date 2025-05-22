import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { ComponentType, JSX } from 'react'

export default function withAdminAuth<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>
) {
  return function AdminAuthComponent(props: P) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
      const token = localStorage.getItem('token')

      const verificarAutenticacao = async () => {
        if (!token) {
          const redirectPath = encodeURIComponent(router.asPath)
          router.push(`/login?redirect=${redirectPath}`)
          return
        }

        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (res.ok) {
            const user = await res.json()

            // Verificar se o usuário é um administrador
            if (!user.isAdmin) {
              router.push('/403') // Redireciona para página de acesso negado (pode ser personalizada)
              return
            }

            setAuthorized(true)
          } else {
            localStorage.removeItem('token')
            const redirectPath = encodeURIComponent(router.asPath)
            router.push(`/login?redirect=${redirectPath}`)
          }
        } catch (err) {
          console.error('Erro na verificação de autenticação:', err)
          localStorage.removeItem('token')
          const redirectPath = encodeURIComponent(router.asPath)
          router.push(`/login?redirect=${redirectPath}`)
        } finally {
          setLoading(false)
        }
      }

      verificarAutenticacao()
    }, [router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Verificando acesso...
        </div>
      )
    }

    if (!authorized) return null

    return <WrappedComponent {...props as P} />
  }
}