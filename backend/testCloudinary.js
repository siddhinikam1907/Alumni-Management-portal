import dotenv from "dotenv";
import cloudinary from "./config/cloudinary.js";

dotenv.config();

const testCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();

    console.log("Cloudinary connection successful:");
    console.log(result);
  } catch (error) {
    console.error("Cloudinary connection failed:");
    console.error(error);
  }
};

testCloudinary();
