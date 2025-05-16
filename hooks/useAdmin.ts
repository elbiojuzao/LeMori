import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export function useAdmin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.data.isAdmin) {
          router.push('/')
          return
        }

        setIsAdmin(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Erro ao verificar permissões:', error)
        router.push('/login')
      }
    }

    checkAdmin()
  }, [])

  return { isLoading, isAdmin }
} 