import jwt from 'jsonwebtoken'

export function verificarToken(token: string): { id: string } {
  if (!token) {
    throw new Error('Token não fornecido')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
    return { id: decoded.id }
  } catch (error) {
    throw new Error('Token inválido')
  }
}
