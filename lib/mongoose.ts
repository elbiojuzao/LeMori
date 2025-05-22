import mongoose from 'mongoose';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Definir interface para global.mongoose
interface GlobalWithMongoose {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const globalWithMongoose = global as typeof global & GlobalWithMongoose;

const cached = globalWithMongoose.mongoose || { conn: null, promise: null };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI não está definida no arquivo .env.local');
}

const uri: string = MONGODB_URI;

async function mongooseConnect() {
  if (cached.conn) {
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    cached.conn = null;
    cached.promise = null;
  }

  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      cached.promise = null;
      throw error;
    }
  }

  const opts: mongoose.ConnectOptions = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    compressors: ['zlib' as const],
    retryWrites: true,
    retryReads: true,
  };

  cached.promise = mongoose
    .connect(uri, opts)
    .then((mongoose) => {
      console.log('Conexão com MongoDB estabelecida com sucesso');

      mongoose.connection.on('error', (err) => {
        console.error('Erro na conexão MongoDB:', err);
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB desconectado');
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconectado com sucesso');
      });

      return mongoose;
    })
    .catch((error) => {
      console.error('Falha ao conectar com MongoDB:', error);
      cached.promise = null;
      throw error;
    });

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    const errorMessage = error.message.includes('timed out')
      ? 'Timeout na conexão com MongoDB. Verifique:\n' +
        '1. Se há problemas de rede/firewall\n' +
        '2. Se o IP está liberado no MongoDB Atlas\n' +
        '3. Se o cluster está ativo\n' +
        '4. Se as credenciais estão corretas'
      : `Erro na conexão: ${error.message}`;
    
    throw new Error(errorMessage);
  }
}
export default mongooseConnect;