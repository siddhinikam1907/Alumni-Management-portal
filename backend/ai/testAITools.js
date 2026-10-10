import "dotenv/config";
import mongoose from "mongoose";

import {
  searchAlumni,
  searchJobs,
  findMentors,
  searchEvents,
  getAlumniContributions,
} from "./aiTools.js";

const MONGO_URI = process.env.MONGO_URI;

const runTests = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully.\n");

    // ============================================================
    // TEST 1: SEARCH ALUMNI
    // ============================================================

    console.log("========================================");
    console.log("TEST 1: SEARCH ALUMNI");
    console.log("========================================");

    const alumniResult = await searchAlumni({
      passoutYear: 2022,
      limit: 5,
    });

    console.log(JSON.stringify(alumniResult, null, 2));

    // ============================================================
    // TEST 2: SEARCH JOBS
    // ============================================================

    console.log("\n========================================");
    console.log("TEST 2: SEARCH JOBS");
    console.log("========================================");

    const jobsResult = await searchJobs({
      location: "Pune",
      skill: "Java",
      limit: 5,
    });

    console.log(JSON.stringify(jobsResult, null, 2));

    // ============================================================
    // TEST 3: FIND MENTORS
    // ============================================================

    console.log("\n========================================");
    console.log("TEST 3: FIND MENTORS");
    console.log("========================================");

    const mentorsResult = await findMentors({
      expertise: "Java",
      preferredMode: "ONLINE",
      minExperience: 3,
      limit: 5,
    });

    console.log(JSON.stringify(mentorsResult, null, 2));

    // ============================================================
    // TEST 4: SEARCH EVENTS
    // ============================================================

    console.log("\n========================================");
    console.log("TEST 4: SEARCH EVENTS");
    console.log("========================================");

    const eventsResult = await searchEvents({
      upcomingOnly: true,
      limit: 5,
    });

    console.log(JSON.stringify(eventsResult, null, 2));

    // ============================================================
    // TEST 5: ALUMNI CONTRIBUTIONS
    // ============================================================

    console.log("\n========================================");
    console.log("TEST 5: ALUMNI CONTRIBUTIONS");
    console.log("========================================");

    const contributionsResult = await getAlumniContributions({
      limit: 5,
    });

    console.log(JSON.stringify(contributionsResult, null, 2));

    console.log("\n========================================");
    console.log("ALL TOOL TESTS COMPLETED");
    console.log("========================================");
  } catch (error) {
    console.error("\nTEST ERROR:");
    console.error(error);
  } finally {
    await mongoose.connection.close();

    console.log("\nMongoDB connection closed.");
  }
};

runTests();
