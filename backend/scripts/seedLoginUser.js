import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

function requireValue(name, value) {
  if (!value?.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

async function seedLoginUser() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
  const dbName = process.env.MONGODB_DB || "robobooks";

  const email = requireValue(
    "SEED_LOGIN_EMAIL",
    process.env.SEED_LOGIN_EMAIL || process.env.DEMO_LOGIN_EMAIL
  ).toLowerCase();
  const password = requireValue(
    "SEED_LOGIN_PASSWORD",
    process.env.SEED_LOGIN_PASSWORD || process.env.DEMO_LOGIN_PASSWORD
  );

  const companyName =
    process.env.SEED_LOGIN_COMPANY_NAME ||
    process.env.DEMO_LOGIN_COMPANY_NAME ||
    "RoboBooks Workspace";
  const phone =
    process.env.SEED_LOGIN_PHONE || process.env.DEMO_LOGIN_PHONE || "9999999999";
  const phoneDialCode = process.env.SEED_LOGIN_PHONE_DIAL_CODE || "+91";
  const phoneIso2 = process.env.SEED_LOGIN_PHONE_ISO2 || "IN";
  const country = process.env.SEED_LOGIN_COUNTRY || "India";
  const state = process.env.SEED_LOGIN_STATE || "Uttar Pradesh";

  await mongoose.connect(mongoUri, { dbName });
  console.log("Connected to MongoDB");

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  const user = await User.findOneAndUpdate(
    {
      $or: [{ email }, { phone }],
    },
    {
      $set: {
        companyName,
        email,
        phone,
        phoneDialCode,
        phoneIso2,
        passwordHash,
        country,
        state,
        isActive: true,
        approvalStatus: "approved",
        approvedAt: now,
        rejectionReason: undefined,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  console.log("Login user is ready");
  console.log(`Email: ${user.email}`);
  console.log(`Phone: ${user.phone}`);
  console.log(`Company: ${user.companyName}`);
  console.log(`Approval: ${user.approvalStatus}`);
  console.log(`Active: ${user.isActive}`);
}

seedLoginUser()
  .catch((error) => {
    console.error("Failed to seed login user:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
