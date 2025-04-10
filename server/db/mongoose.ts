import mongoose from 'mongoose';
import { log } from '../vite';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-app');
    log(`MongoDB Connected: ${conn.connection.host}`, 'mongodb');
  } catch (error) {
    if (error instanceof Error) {
      log(`Error: ${error.message}`, 'mongodb-error');
      process.exit(1);
    }
    log('Unknown MongoDB connection error occurred', 'mongodb-error');
    process.exit(1);
  }
};

export default connectDB;