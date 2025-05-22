import type { NextApiRequest, NextApiResponse } from 'next'
import mongooseConnect from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('Iniciando processo de login...')
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    console.log('Email recebido:', email)

    console.log('Conectando ao banco de dados...')
    await mongooseConnect()
    console.log('Conexão estabelecida com sucesso')
    console.log('Estado da conexão:', mongoose.connection.readyState)

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Conexão com o banco de dados não estabelecida')
    }

    console.log('Database:', db.databaseName)

    // Verifica se a coleção existe
    const collections = await db.listCollections().toArray()
    console.log('Coleções disponíveis:', collections.map(c => c.name))

    console.log('Buscando usuário...')
    // Busca case-insensitive
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    }).select('+senha')

    console.log('Resultado da busca:', user ? 'Usuário encontrado' : 'Usuário não encontrado')
    
    if (!user) {
      // Faz uma busca para ver todos os emails na coleção
      const allUsers = await User.find({}, { email: 1 })
      console.log('Emails cadastrados:', allUsers.map(u => u.email))
      
      console.log('Usuário não encontrado:', email)
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    console.log('Verificando senha...')
    const senhaCorreta = await bcrypt.compare(senha, user.senha)
    if (!senhaCorreta) {
      console.log('Senha incorreta para o usuário:', email)
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }
    
    if (!user.emailVerificado) {
      console.log('Email não verificado para o usuário:', email)
      return res.status(403).json({ error: 'Por favor, verifique seu e-mail antes de fazer login' })
    }

    console.log('Gerando token JWT...')
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        nome: user.nome, 
        email: user.email,
        isAdmin: user.isAdmin 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Atualiza último login
    await User.findByIdAndUpdate(user._id, {
      $set: { ultimoLogin: new Date() }
    })

    console.log('Login realizado com sucesso para:', email)
    return res.status(200).json({ 
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        isAdmin: user.isAdmin
      }
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
    console.error('Erro no processo de login:', errorMessage)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    })
  }
}
