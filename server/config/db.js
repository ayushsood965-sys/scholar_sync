const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }
    // Attempt connecting to the configured URI, with a fast 2-second timeout
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️ Connection to primary MongoDB failed: ${error.message}`);
    console.log('🔄 Spawning an in-memory MongoDB server as fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      // Override the environment variable so other components use the in-memory server
      process.env.MONGO_URI = mongoUri;
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`🚀 In-Memory MongoDB Started and Connected: ${mongoUri}`);
    } catch (innerError) {
      console.error(`❌ Fallback in-memory MongoDB failed: ${innerError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
