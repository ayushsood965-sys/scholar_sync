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
    await backfillSSNos();
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
      await backfillSSNos();
    } catch (innerError) {
      console.error(`❌ Fallback in-memory MongoDB failed: ${innerError.message}`);
      process.exit(1);
    }
  }
};

const backfillSSNos = async () => {
  try {
    const User = require('../models/User');
    const studentsWithoutSS = await User.find({
      role: 'STUDENT',
      $or: [
        { 'profile.ssNo': { $exists: false } },
        { 'profile.ssNo': '' },
        { 'profile.ssNo': null }
      ]
    });
    if (studentsWithoutSS.length > 0) {
      console.log(`[Migration] Found ${studentsWithoutSS.length} students without SS No. Backfilling...`);
      for (const student of studentsWithoutSS) {
        if (!student.profile) student.profile = {};
        // Trigger save to fire pre-save hook and generate a unique SS No.
        await student.save();
      }
      console.log(`[Migration] Successfully backfilled SS No. for all students.`);
    }
  } catch (err) {
    console.error('Error backfilling SS No.:', err);
  }
};

module.exports = connectDB;
