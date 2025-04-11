import jwt from 'jsonwebtoken'

export function verifyToken(token: string): { userId: string } {
  if (!token) {
    throw new Error('Token não fornecido')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return { userId: decoded.userId }
  } catch (error) {
    throw new Error('Token inválido')
  }
}
