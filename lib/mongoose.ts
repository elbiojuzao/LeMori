import mongoose from 'mongoose';

const mongooseConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI não está definida no .env.local');

  return mongoose.connect(uri);
};

export default mongooseConnect;
