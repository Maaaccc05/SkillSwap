const mongoose = require('mongoose');

  mongoose.set('strictQuery', true); // Suppress deprecation warning

  const connectDB = async () => {
    console.log('MONGO_URI:', process.env.MONGO_URI); // Debug log
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file. Check .env file and dotenv configuration.');
    }
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Database connection error: ${error.message}`);
      process.exit(1);
    }
  };

  module.exports = connectDB;