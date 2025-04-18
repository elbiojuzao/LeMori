
export async function login(email: string, senha: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || 'Erro ao fazer login')
  }

  const data = await res.json()

  // Armazena o token no localStorage (temporariamente; depois podemos usar cookies seguros)
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

  return data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}