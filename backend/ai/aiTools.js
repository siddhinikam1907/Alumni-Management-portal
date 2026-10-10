import Alumni from "../models/Alumni.js";
import Job from "../models/Job.js";
import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";
import MentorProfile from "../models/MentorProfile.js";
import User from "../models/User.js";
import MentorRequest from "../models/MentorRequest.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

// Safely limit the number of database results
const getSafeLimit = (limit, defaultLimit = 10, maxLimit = 20) => {
  return Math.min(Math.max(Number(limit) || defaultLimit, 1), maxLimit);
};

// Escape special regex characters
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/*
|--------------------------------------------------------------------------
| 1. SEARCH ALUMNI
|--------------------------------------------------------------------------
|
| Gemini can search alumni using:
|
| - name
| - passout year
| - department
| - current location
| - company
| - area of expertise
|
|--------------------------------------------------------------------------
*/

export const searchAlumni = async ({
  name,
  passoutYear,
  department,
  currentLocation,
  companyName,
  areaOfExpertise,
  limit = 10,

  // Internal parameter.
  // Gemini does NOT directly control this.
  withinIds = [],
}) => {
  try {
    const query = {};

    /*
    |--------------------------------------------------------------------------
    | Restrict search to previous results
    |--------------------------------------------------------------------------
    |
    | Used for questions like:
    | "Which of them are in Ahmedabad?"
    | "Out of the above 10..."
    | "What about Pune?"
    |
    */

    if (Array.isArray(withinIds) && withinIds.length > 0) {
      query._id = {
        $in: withinIds,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Name
    |--------------------------------------------------------------------------
    */

    if (name?.trim()) {
      query.name = {
        $regex: name.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Passout year
    |--------------------------------------------------------------------------
    */

    if (passoutYear) {
      query.passoutYear = Number(passoutYear);
    }

    /*
    |--------------------------------------------------------------------------
    | Department
    |--------------------------------------------------------------------------
    */

    if (department?.trim()) {
      query.department = {
        $regex: department.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Current location
    |--------------------------------------------------------------------------
    */

    if (currentLocation?.trim()) {
      query.currentLocation = {
        $regex: currentLocation.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Company
    |--------------------------------------------------------------------------
    */

    if (companyName?.trim()) {
      query.companyName = {
        $regex: companyName.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Area of expertise
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | areaOfExpertise is an array.
    |
    | We use exact matching so:
    |
    | Java       -> matches Java
    | java       -> matches Java
    | JAVA       -> matches Java
    | JavaScript -> does NOT match Java
    |
    */

    if (areaOfExpertise?.trim()) {
      const expertise = escapeRegex(areaOfExpertise.trim());

      query.areaOfExpertise = {
        $elemMatch: {
          $regex: `^${expertise}$`,
          $options: "i",
        },
      };
    }

    const safeLimit = getSafeLimit(limit);

    const alumni = await Alumni.find(query)
      .select(
        "name passoutYear department nativePlace currentLocation companyName previousCompanies areaOfExpertise linkedinUrl photo",
      )
      .limit(safeLimit)
      .lean();

    return {
      success: true,
      count: alumni.length,

      filters: {
        name: name || null,
        passoutYear: passoutYear || null,
        department: department || null,
        currentLocation: currentLocation || null,
        companyName: companyName || null,
        areaOfExpertise: areaOfExpertise || null,
      },

      alumni,
    };
  } catch (error) {
    console.error("searchAlumni tool error:", error);

    return {
      success: false,
      count: 0,
      alumni: [],
      message: "Unable to search alumni at the moment.",
    };
  }
};

/*
|--------------------------------------------------------------------------
| 2. SEARCH JOBS
|--------------------------------------------------------------------------
|
| Gemini can search jobs using:
|
| - title
| - company
| - location
| - job type
| - skill
| - general search
|
|--------------------------------------------------------------------------
*/

export const searchJobs = async ({
  title,
  companyName,
  location,
  jobType,
  skill,
  search,
  limit = 10,
}) => {
  try {
    const query = {};

    /*
    |--------------------------------------------------------------------------
    | Job title
    |--------------------------------------------------------------------------
    */

    if (title?.trim()) {
      query.title = {
        $regex: title.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Company
    |--------------------------------------------------------------------------
    */

    if (companyName?.trim()) {
      query.companyName = {
        $regex: companyName.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Location
    |--------------------------------------------------------------------------
    */

    if (location?.trim()) {
      query.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Job type
    |--------------------------------------------------------------------------
    */

    if (jobType?.trim()) {
      query.jobType = jobType.trim().toUpperCase();
    }

    /*
    |--------------------------------------------------------------------------
    | Skill
    |--------------------------------------------------------------------------
    */

    if (skill?.trim()) {
      query.skills = {
        $regex: skill.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | General search
    |--------------------------------------------------------------------------
    */

    if (search?.trim()) {
      const searchRegex = {
        $regex: search.trim(),
        $options: "i",
      };

      query.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
        { skills: searchRegex },
      ];
    }

    const safeLimit = getSafeLimit(limit);

    const jobs = await Job.find(query)
      .populate({
        path: "postedBy",
        select: "name role",
      })
      .sort({
        createdAt: -1,
      })
      .limit(safeLimit)
      .lean();

    const formattedJobs = jobs.map((job) => ({
      id: job._id,
      title: job.title,
      companyName: job.companyName,
      description: job.description,
      location: job.location,
      jobType: job.jobType,
      skills: job.skills || [],
      experience: job.experience,
      salary: job.salary,
      applicationLink: job.applicationLink,

      postedBy: job.postedBy
        ? {
            name: job.postedBy.name,
          }
        : null,

      createdAt: job.createdAt,
    }));

    return {
      success: true,
      count: formattedJobs.length,

      filters: {
        title: title || null,
        companyName: companyName || null,
        location: location || null,
        jobType: jobType || null,
        skill: skill || null,
        search: search || null,
      },

      jobs: formattedJobs,
    };
  } catch (error) {
    console.error("searchJobs tool error:", error);

    return {
      success: false,
      count: 0,
      jobs: [],
      message: "Unable to search jobs at the moment.",
    };
  }
};

/*
|--------------------------------------------------------------------------
| 3. FIND MENTORS
|--------------------------------------------------------------------------
|
| Gemini can find mentors using:
|
| - name
| - expertise
| - mentorship topic
| - preferred mode
| - current location
| - minimum experience
|
|--------------------------------------------------------------------------
*/

export const findMentors = async ({
  name,
  expertise,
  mentorshipTopic,
  preferredMode,
  currentLocation,
  minExperience,
  limit = 10,
}) => {
  try {
    const query = {
      available: true,
    };

    /*
    |--------------------------------------------------------------------------
    | Expertise
    |--------------------------------------------------------------------------
    */

    if (expertise?.trim()) {
      query.expertise = {
        $regex: expertise.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Mentorship topic
    |--------------------------------------------------------------------------
    */

    if (mentorshipTopic?.trim()) {
      query.mentorshipTopics = {
        $regex: mentorshipTopic.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Preferred mode
    |--------------------------------------------------------------------------
    */

    if (preferredMode?.trim()) {
      const mode = preferredMode.trim().toUpperCase();

      if (["ONLINE", "OFFLINE"].includes(mode)) {
        query.preferredMode = {
          $in: [mode, "BOTH"],
        };
      } else if (mode === "BOTH") {
        query.preferredMode = "BOTH";
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Minimum experience
    |--------------------------------------------------------------------------
    */

    if (minExperience !== undefined) {
      query.yearsOfExperience = {
        $gte: Number(minExperience) || 0,
      };
    }

    const safeLimit = getSafeLimit(limit);

    /*
    |--------------------------------------------------------------------------
    | Get mentor profiles
    |--------------------------------------------------------------------------
    */

    const mentors = await MentorProfile.find(query)
      .populate({
        path: "alumni",
        select: "name email alumniId",

        populate: {
          path: "alumniId",
          select:
            "department passoutYear currentLocation companyName areaOfExpertise linkedinUrl",
        },
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Filter by name and current location
    |--------------------------------------------------------------------------
    */

    let filteredMentors = mentors;

    if (name?.trim()) {
      const nameRegex = new RegExp(name.trim(), "i");

      filteredMentors = filteredMentors.filter(
        (mentor) => mentor.alumni?.name && nameRegex.test(mentor.alumni.name),
      );
    }

    if (currentLocation?.trim()) {
      const locationRegex = new RegExp(currentLocation.trim(), "i");

      filteredMentors = filteredMentors.filter(
        (mentor) =>
          mentor.alumni?.alumniId?.currentLocation &&
          locationRegex.test(mentor.alumni.alumniId.currentLocation),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Limit
    |--------------------------------------------------------------------------
    */

    filteredMentors = filteredMentors.slice(0, safeLimit);

    /*
    |--------------------------------------------------------------------------
    | Format mentor response
    |--------------------------------------------------------------------------
    */

    const formattedMentors = filteredMentors.map((mentor) => {
      const user = mentor.alumni;
      const alumni = user?.alumniId;

      return {
        id: mentor._id,

        name: user?.name || "Unknown",

        department: alumni?.department || null,

        passoutYear: alumni?.passoutYear || null,

        currentLocation: alumni?.currentLocation || null,

        companyName: alumni?.companyName || null,

        expertise: mentor.expertise || [],

        mentorshipTopics: mentor.mentorshipTopics || [],

        yearsOfExperience: mentor.yearsOfExperience || 0,

        preferredMode: mentor.preferredMode || null,

        available: mentor.available,

        bio: mentor.bio || "",

        linkedinUrl: alumni?.linkedinUrl || null,
      };
    });

    return {
      success: true,
      count: formattedMentors.length,

      filters: {
        name: name || null,
        expertise: expertise || null,
        mentorshipTopic: mentorshipTopic || null,
        preferredMode: preferredMode || null,
        currentLocation: currentLocation || null,
        minExperience: minExperience ?? null,
      },

      mentors: formattedMentors,
    };
  } catch (error) {
    console.error("findMentors tool error:", error);

    return {
      success: false,
      count: 0,
      mentors: [],
      message: "Unable to find mentors at the moment.",
    };
  }
};

/*
|--------------------------------------------------------------------------
| 4. SEARCH EVENTS
|--------------------------------------------------------------------------
|
| Gemini can search events using:
|
| - title
| - event type
| - location
| - date
| - upcoming events
|
|--------------------------------------------------------------------------
*/

export const searchEvents = async ({
  title,
  eventType,
  location,
  date,
  upcomingOnly = false,
  limit = 10,
}) => {
  try {
    const query = {};

    /*
    |--------------------------------------------------------------------------
    | Title
    |--------------------------------------------------------------------------
    */

    if (title?.trim()) {
      query.title = {
        $regex: title.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Event type
    |--------------------------------------------------------------------------
    */

    if (eventType?.trim()) {
      const normalizedEventType = eventType
        .trim()
        .toLowerCase()
        .replace(/[_-]/g, " ");

      const eventTypeMap = {
        technical: "TECH_TALK",
        "technical talk": "TECH_TALK",
        "tech talk": "TECH_TALK",
        tech: "TECH_TALK",
        "tech talk session": "TECH_TALK",
      };

      const mappedEventType = eventTypeMap[normalizedEventType];

      if (mappedEventType) {
        query.eventType = mappedEventType;
      } else {
        query.eventType = {
          $regex: eventType.trim(),
          $options: "i",
        };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Location
    |--------------------------------------------------------------------------
    */

    if (location?.trim()) {
      query.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Specific date
    |--------------------------------------------------------------------------
    */

    if (date) {
      const requestedDate = new Date(date);

      if (!Number.isNaN(requestedDate.getTime())) {
        const startOfDay = new Date(requestedDate);

        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(requestedDate);

        endOfDay.setHours(23, 59, 59, 999);

        query.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Upcoming events
    |--------------------------------------------------------------------------
    */

    if (upcomingOnly === true) {
      query.date = {
        ...(query.date || {}),
        $gte: new Date(),
      };
    }

    const safeLimit = getSafeLimit(limit);

    const events = await Event.find(query)
      .populate({
        path: "createdBy",
        select: "name",
      })
      .sort({
        date: 1,
      })
      .limit(safeLimit)
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Registration counts
    |--------------------------------------------------------------------------
    */

    const eventIds = events.map((event) => event._id);

    let registrationCounts = [];

    if (eventIds.length > 0) {
      registrationCounts = await EventRegistration.aggregate([
        {
          $match: {
            event: {
              $in: eventIds,
            },
          },
        },

        {
          $group: {
            _id: "$event",

            count: {
              $sum: 1,
            },
          },
        },
      ]);
    }

    const registrationMap = new Map(
      registrationCounts.map((item) => [item._id.toString(), item.count]),
    );

    /*
    |--------------------------------------------------------------------------
    | Format events
    |--------------------------------------------------------------------------
    */

    const formattedEvents = events.map((event) => ({
      id: event._id,

      title: event.title,

      description: event.description,

      eventType: event.eventType,

      date: event.date,

      time: event.time,

      location: event.location,

      registrationRequired: event.registrationRequired,

      registrationDeadline: event.registrationDeadline,

      createdBy: event.createdBy?.name || null,

      registrationCount: registrationMap.get(event._id.toString()) || 0,
    }));

    return {
      success: true,
      count: formattedEvents.length,

      filters: {
        title: title || null,
        eventType: eventType || null,
        location: location || null,
        date: date || null,
        upcomingOnly: upcomingOnly || false,
      },

      events: formattedEvents,
    };
  } catch (error) {
    console.error("searchEvents tool error:", error);

    return {
      success: false,
      count: 0,
      events: [],
      message: "Unable to search events at the moment.",
    };
  }
};

/*
|--------------------------------------------------------------------------
| 5. GET ALUMNI CONTRIBUTIONS
|--------------------------------------------------------------------------
|
| Finds alumni based on:
|
| - name
| - passout year
| - department
|
| And calculates:
|
| - jobs posted
| - mentor status
| - mentorship requests received
| - mentorship requests accepted
| - event registrations
| - total contribution count
|
|--------------------------------------------------------------------------
*/

export const getAlumniContributions = async ({
  name,
  passoutYear,
  department,
  limit = 10,
}) => {
  try {
    const alumniQuery = {};

    /*
    |--------------------------------------------------------------------------
    | Name
    |--------------------------------------------------------------------------
    */

    if (name?.trim()) {
      alumniQuery.name = {
        $regex: name.trim(),
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Passout year
    |--------------------------------------------------------------------------
    */

    if (passoutYear) {
      alumniQuery.passoutYear = Number(passoutYear);
    }

    /*
    |--------------------------------------------------------------------------
    | Department
    |--------------------------------------------------------------------------
    */

    if (department?.trim()) {
      alumniQuery.department = {
        $regex: department.trim(),
        $options: "i",
      };
    }

    const safeLimit = getSafeLimit(limit, 10, 20);

    /*
    |--------------------------------------------------------------------------
    | Find alumni
    |--------------------------------------------------------------------------
    */

    const alumni = await Alumni.find(alumniQuery)
      .select(
        "name passoutYear department currentLocation companyName linkedinUrl",
      )
      .lean();

    if (alumni.length === 0) {
      return {
        success: true,
        count: 0,
        contributions: [],
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Find corresponding users
    |--------------------------------------------------------------------------
    */

    const alumniIds = alumni.map((alumnus) => alumnus._id);

    const users = await User.find({
      alumniId: {
        $in: alumniIds,
      },
    })
      .select("_id name alumniId")
      .lean();

    const userByAlumniId = new Map(
      users
        .filter((user) => user.alumniId)
        .map((user) => [user.alumniId.toString(), user]),
    );

    /*
    |--------------------------------------------------------------------------
    | Calculate contributions
    |--------------------------------------------------------------------------
    */

    const contributions = await Promise.all(
      alumni.map(async (alumnus) => {
        const user = userByAlumniId.get(alumnus._id.toString());

        /*
        |--------------------------------------------------------------------------
        | Alumni has no linked user account
        |--------------------------------------------------------------------------
        */

        if (!user) {
          return {
            name: alumnus.name,

            passoutYear: alumnus.passoutYear,

            department: alumnus.department,

            currentLocation: alumnus.currentLocation,

            companyName: alumnus.companyName,

            jobsPosted: 0,

            mentor: false,

            mentorshipRequestsReceived: 0,

            mentorshipRequestsAccepted: 0,

            eventRegistrations: 0,

            totalContributions: 0,
          };
        }

        /*
        |--------------------------------------------------------------------------
        | Jobs posted
        |--------------------------------------------------------------------------
        */

        const jobsPosted = await Job.countDocuments({
          postedBy: user._id,
        });

        /*
        |--------------------------------------------------------------------------
        | Mentor profile
        |--------------------------------------------------------------------------
        */

        const mentorProfile = await MentorProfile.findOne({
          alumni: user._id,
        })
          .select("_id")
          .lean();

        const mentor = !!mentorProfile;

        /*
        |--------------------------------------------------------------------------
        | Mentorship requests received
        |--------------------------------------------------------------------------
        */

        const mentorshipRequestsReceived = mentorProfile
          ? await MentorRequest.countDocuments({
              mentor: user._id,
            })
          : 0;

        /*
        |--------------------------------------------------------------------------
        | Accepted mentorship requests
        |--------------------------------------------------------------------------
        */

        const mentorshipRequestsAccepted = mentorProfile
          ? await MentorRequest.countDocuments({
              mentor: user._id,
              status: "ACCEPTED",
            })
          : 0;

        /*
        |--------------------------------------------------------------------------
        | Event registrations
        |--------------------------------------------------------------------------
        */

        const eventRegistrations = await EventRegistration.countDocuments({
          user: user._id,
        });

        /*
        |--------------------------------------------------------------------------
        | Total contribution count
        |--------------------------------------------------------------------------
        |
        | Calculated dynamically.
        | It is NOT stored as a database field.
        |
        */

        const totalContributions =
          jobsPosted +
          (mentor ? 1 : 0) +
          mentorshipRequestsReceived +
          mentorshipRequestsAccepted +
          eventRegistrations;

        return {
          name: alumnus.name,

          passoutYear: alumnus.passoutYear,

          department: alumnus.department,

          currentLocation: alumnus.currentLocation,

          companyName: alumnus.companyName,

          jobsPosted,

          mentor,

          mentorshipRequestsReceived,

          mentorshipRequestsAccepted,

          eventRegistrations,

          totalContributions,
        };
      }),
    );

    /*
    |--------------------------------------------------------------------------
    | Highest contributors first
    |--------------------------------------------------------------------------
    */

    contributions.sort((a, b) => b.totalContributions - a.totalContributions);

    /*
    |--------------------------------------------------------------------------
    | Apply limit
    |--------------------------------------------------------------------------
    */

    const limitedContributions = contributions.slice(0, safeLimit);

    return {
      success: true,
      count: limitedContributions.length,

      filters: {
        name: name || null,
        passoutYear: passoutYear || null,
        department: department || null,
      },

      contributions: limitedContributions,
    };
  } catch (error) {
    console.error("getAlumniContributions tool error:", error);

    return {
      success: false,
      count: 0,
      contributions: [],
      message: "Unable to calculate alumni contributions at the moment.",
    };
  }
};
