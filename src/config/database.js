const mongoose = require("mongoose");

async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "";
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = connectDB;
