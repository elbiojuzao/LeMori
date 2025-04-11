import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'chave_super_secreta'

interface TokenPayload {
  userId: string

  email?: string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}
