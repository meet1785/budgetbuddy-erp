import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_CLOUD_URI = 'mongodb+srv://meet:meetshah@project.n6lhrxe.mongodb.net/?retryWrites=true&w=majority&appName=Project';

const getMongoUri = (): string => {
  // Try cloud MongoDB first, fallback to local when explicitly requested
  if (process.env.USE_LOCAL_MONGO === 'true') {
    return process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/budgetbuddy_erp';
  }
  return process.env.MONGODB_URI || DEFAULT_CLOUD_URI;
};

const connectDatabase = async (): Promise<void> => {
  try {
    const MONGODB_URI = getMongoUri();
    
    console.log('🔗 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: process.env.DB_NAME || 'budgetbuddy_erp',
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });


    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error: any) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // If cloud connection fails, try local fallback
    if (!process.env.USE_LOCAL_MONGO && error.message.includes('ETIMEOUT')) {
      console.log('🔄 Cloud MongoDB connection failed, attempting local fallback...');
      
      try {
  const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/budgetbuddy_erp';
        const conn = await mongoose.connect(localUri, {
          dbName: process.env.DB_NAME || 'budgetbuddy_erp',
        });
        

        return;
        
      } catch (localError: any) {
        console.error('❌ Local MongoDB connection also failed:', localError.message);
        console.log('💡 Using in-memory storage for development...');
        return; // Continue without database for development
      }
    }
    
    console.log('💡 Continuing without database connection for development...');
    // Don't exit in development - allow app to run without DB for frontend development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDatabase;