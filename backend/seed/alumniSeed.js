import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import csv from "csv-parser";

import Alumni from "../models/Alumni.js";

dotenv.config();

const alumni = [];

function parseDOB(value, rowNumber) {
  if (!value || value.trim() === "") {
    throw new Error(`Missing DOB at CSV row ${rowNumber}`);
  }

  const [day, month, year] = value.trim().split("-");

  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getDate() !== Number(day) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getFullYear() !== Number(year)
  ) {
    throw new Error(`Invalid DOB "${value}" at CSV row ${rowNumber}`);
  }

  return date;
}

fs.createReadStream("./seed/alumni_dummy_dataset_2000.csv")
  .pipe(csv())
  .on("data", (row) => {
    try {
      const rowNumber = alumni.length + 2;

      alumni.push({
        name: row.name?.trim(),

        passoutYear: Number(row.passoutYear),

        department: row.department?.trim(),

        nativePlace: row.nativePlace?.trim(),

        currentLocation: row.currentLocation?.trim(),

        companyName: row.companyName?.trim(),

        previousCompanies: row.previousCompanies
          ? row.previousCompanies
              .split(",")
              .map((company) => company.trim())
              .filter(Boolean)
          : [],

        areaOfExpertise: row.areaOfExpertise
          ? row.areaOfExpertise
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [],

        linkedinUrl: row.linkedinUrl?.trim(),

        email: row.email?.trim().toLowerCase(),

        mobileNo: row.mobileNo?.trim(),

        photo: row.photo?.trim(),

        dob: parseDOB(row.dob, rowNumber),
      });
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  })
  .on("end", async () => {
    try {
      console.log(`CSV read successfully: ${alumni.length} records`);

      await mongoose.connect(process.env.MONGO_URI);

      console.log("MongoDB connected");

      await Alumni.deleteMany({});

      await Alumni.insertMany(alumni);

      console.log(`${alumni.length} alumni records inserted successfully`);

      await mongoose.connection.close();

      process.exit(0);
    } catch (error) {
      console.error("Seeding failed:", error.message);

      await mongoose.connection.close();

      process.exit(1);
    }
  })
  .on("error", (error) => {
    console.error("CSV reading failed:", error.message);
  });
