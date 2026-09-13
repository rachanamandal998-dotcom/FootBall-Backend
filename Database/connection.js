const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sindhuli-fc";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
    return true;
  } catch (error) {
    console.log("MongoDB NOT running - start MongoDB to save and load club data");
    console.log(error.message);
    return false;
  }
};

module.exports = connectDB;
