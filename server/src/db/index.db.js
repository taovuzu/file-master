import mongoose from "mongoose";
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    logger.info('MongoDB connected successfully', {
      host: connectionInstance.connection.host,
      name: connectionInstance.connection.name
    });
    
    return connectionInstance;
  } catch (error) {
    logger.error('Database connection failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

export default connectDB;