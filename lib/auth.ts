import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'chave_super_secreta'

export interface TokenPayload {
  userId: string
  email: string
  isAdmin: boolean
  iat?: number
  exp?: number
}

export function signToken(payload: TokenPayload): string {
  const tokenPayload = {
    ...payload,
    isAdmin: Boolean(payload.isAdmin)
  }
  return jwt.sign(tokenPayload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        reject(err)
        return
      }
      
      const payload = decoded as any
      if (!payload || typeof payload !== 'object') {
        reject(new Error('Token inválido'))
        return
      }

      if (!payload.userId || !payload.email) {
        reject(new Error('Token com estrutura inválida'))
        return
      }

      const validatedPayload: TokenPayload = {
        userId: payload.userId,
        email: payload.email,
        isAdmin: Boolean(payload.isAdmin),
        iat: payload.iat,
        exp: payload.exp
      }

      resolve(validatedPayload)
    })
  })
}
