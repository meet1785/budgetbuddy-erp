const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://meet:meetshah@project.n6lhrxe.mongodb.net/?retryWrites=true&w=majority&appName=Project';

async function testConnection() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      dbName: 'budgetbuddy_erp',
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    // Test creating a simple collection
    const testSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model('Test', testSchema);
    
    const testDoc = new Test({ name: 'Connection Test' });
    await testDoc.save();
    console.log('✅ Test document created successfully');
    
    await Test.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document cleaned up');
    
    await mongoose.connection.close();
    console.log('📴 Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

testConnection();