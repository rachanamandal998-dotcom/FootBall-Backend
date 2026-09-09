const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sindhuliFC');
    console.log('MongoDB Connected');
  } catch (error) {
    console.log('MongoDB NOT running - Backend still works but no data saved');
    console.log('Tip: Install MongoDB Compass or use Atlas to save data');
  }
};

module.exports = connectDB;