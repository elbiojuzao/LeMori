import mongooseConnect from './mongoose';

async function dbConnect() {
  return mongooseConnect();
}

export default dbConnect;
