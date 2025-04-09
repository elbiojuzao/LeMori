export async function login(email: string, senha: string) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {
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