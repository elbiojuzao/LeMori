import React, { useEffect, useState, ComponentType, JSX } from 'react'
import { useRouter } from 'next/router'

function withAuth<P extends JSX.IntrinsicAttributes>(WrappedComponent: ComponentType<P>) {
  const AuthenticatedComponent = (props: P) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
      } else {
        setIsLoading(false)
      }
    }, [router])

    if (isLoading) {
      return (
        <div className="p-4 text-center text-gray-600">
          Verificando autenticação...
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }

  return AuthenticatedComponent
}

export default withAuth
