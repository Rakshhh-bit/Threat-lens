const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cybershield";

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, dbName: "cybershield" });
    console.log("✅ MongoDB Connected");

    // Clean up any stale or problematic unique indexes on mobile in users collection
    try {
      const collections = await mongoose.connection.db.listCollections({ name: "users" }).toArray();
      if (collections.length > 0) {
        const indexes = await mongoose.connection.db.collection("users").indexes();
        const mobileIndex = indexes.find((idx) => idx.name === "mobile_1" || (idx.key && idx.key.mobile));
        if (mobileIndex && mobileIndex.unique) {
          console.log("Dropping non-sparse/conflicting mobile index:", mobileIndex.name);
          await mongoose.connection.db.collection("users").dropIndex(mobileIndex.name);
          console.log("✅ Successfully dropped conflicting mobile index");
        }
      }
    } catch (idxErr) {
      console.warn("Index check/cleanup notice:", idxErr.message);
    }
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed, continuing in fallback mode:", error.message);
  }
};

module.exports = connectDB;