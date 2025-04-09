import jwt from 'jsonwebtoken'

export function verificarToken(token: string): string {
  const secret = process.env.JWT_SECRET as string
  const decoded = jwt.verify(token, secret) as { id: string }
  return decoded.id
}