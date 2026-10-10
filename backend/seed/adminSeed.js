import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const adminEmail = "admin@alumniportal.com";

    // Check whether admin already exists
    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Create admin
    const admin = await User.create({
      name: "Portal Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      alumniId: null,
    });

    console.log("Admin created successfully");
    console.log({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();
