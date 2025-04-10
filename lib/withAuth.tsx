import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { ComponentType, JSX } from 'react'

export default function withAuth<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>
) {
  return function AuthComponent(props: P) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
      const token = localStorage.getItem('token')

      const verificarAutenticacao = async () => {
        if (!token) {
          router.push('/login')
          return
        }

        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (res.ok) {
            setAuthorized(true)
          } else {
            localStorage.removeItem('token')
            router.push('/login')
          }
        } catch (err) {
          console.error('Erro na verificação de autenticação:', err)
          localStorage.removeItem('token')
          router.push('/login')
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

    return authorized ? <WrappedComponent {...props} /> : null
  }
}