// backend/src/config/db.js
import mongoose from "mongoose";
import User from "../models/User.js";

function getDataDeletionAt() {
  const deletionDate = new Date();
  deletionDate.setMonth(deletionDate.getMonth() + 3);
  return deletionDate;
}

async function migrateUserRetention() {
  const userCollection = mongoose.connection.collection("users");
  const indexes = await userCollection.indexes();
  const legacyExpireIndex = indexes.find(
    (index) => index.key && index.key.expireAt === 1,
  );

  if (legacyExpireIndex) {
    await userCollection.dropIndex(legacyExpireIndex.name);
    console.log(`Dropped legacy TTL index: ${legacyExpireIndex.name}`);
  }

  const dataDeletionAt = getDataDeletionAt();
  const updateResult = await User.updateMany(
    {
      $or: [
        { dataDeletionAt: { $exists: false } },
        { dataDeletionAt: null },
        { expireAt: { $exists: true } },
      ],
    },
    {
      $set: { dataDeletionAt },
      $unset: { expireAt: 1 },
    },
    { strict: false },
  );

  if (updateResult.modifiedCount > 0) {
    console.log(
      `Backfilled dataDeletionAt for ${updateResult.modifiedCount} user records`,
    );
  }

  await User.syncIndexes();
}

export const connectDb = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(uri);
    await migrateUserRetention();

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
