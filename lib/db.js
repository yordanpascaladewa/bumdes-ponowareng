import mongoose from 'mongoose';

// ✅ SUDAH DIPERBAIKI (Ada tanda kutipnya)
const MONGODB_URI = "mongodb+srv://nuryadi:bumdes123@pakanbebek.jebx2iw.mongodb.net/bumdes?retryWrites=true&w=majority&appName=PakanBebek";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;