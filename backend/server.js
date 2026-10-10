import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import alumniRoutes from "./routes/alumniRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import eventRegistrationRoutes from "./routes/eventRegistrationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import mentorRequestRoutes from "./routes/mentorRequestRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import studentProfileRoutes from "./routes/studentProfileRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
dotenv.config();
console.log("Cloudinary secret exists:", {
  exists: !!process.env.CLOUDINARY_API_SECRET,
  length: process.env.CLOUDINARY_API_SECRET?.length,
});
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/alumni", alumniRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/event-registrations", eventRegistrationRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/mentor-requests", mentorRequestRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/student-profile", studentProfileRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/ai", aiRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
