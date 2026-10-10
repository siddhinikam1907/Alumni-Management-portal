import openai from "./openaiClient.js";

import {
  searchAlumni,
  searchJobs,
  findMentors,
  searchEvents,
  getAlumniContributions,
} from "./aiTools.js";

/*
|--------------------------------------------------------------------------
| SYSTEM INSTRUCTION
|--------------------------------------------------------------------------
*/

const SYSTEM_INSTRUCTION = `
You are AlumniHub AI, an intelligent assistant for a college Alumni Management and Engagement Portal.

Your job is to understand the user's natural-language request and select the correct backend tool.

AVAILABLE CAPABILITIES:

1. SEARCH ALUMNI

Use search_alumni when the user wants to find alumni based on:
- name
- passout year
- department
- current location
- company
- area of expertise


2. SEARCH JOBS

Use search_jobs when the user wants to find jobs based on:
- job title
- company
- location
- job type
- skill
- general job search


3. FIND MENTORS

Use find_mentors when the user wants to find mentors based on:
- name
- expertise
- mentorship topic
- preferred mode
- current location
- minimum experience


4. SEARCH EVENTS

Use search_events when the user wants to find events based on:
- event title
- event type
- location
- date
- upcoming events


5. ALUMNI CONTRIBUTIONS

Use get_alumni_contributions when the user asks:
- who contributes the most
- top contributing alumni
- alumni contributions
- contribution ranking
- contributions of alumni from a particular year
- contributions of alumni from a particular department


IMPORTANT CONVERSATION CONTEXT RULES:

A previous conversation context may be provided.

You MUST distinguish between:

A. FOLLOW-UP QUESTION

A question is a follow-up when the user is clearly referring to the previous search.

Examples:

"Which of them are in Ahmedabad?"
"I want specifically working in Pune."
"What about Mumbai?"
"Show the ones from Computer Science."
"Out of the above 10, which are in Ahmedabad."
"Show their LinkedIn profiles."
"Which of these have Java experience."

For these questions:

- Set refinePrevious = true.
- Preserve the previous search criteria.
- Add or modify only the criteria mentioned in the new message.
- If the user refers to "them", "those", "these", "above", "previous", or similar wording, treat the previous result set as the scope.


B. NEW QUESTION

A question is NEW when the user starts a different search or asks about a different portal capability.

Examples:

"Find jobs in Pune."
"Show upcoming events."
"Find mentors for Java."
"Who are the top contributors?"
"Find alumni from 2020."

For these questions:

- Set refinePrevious = false.
- Do NOT inherit filters from the previous search.
- Start a completely new search.


IMPORTANT:

A completely new question must NEVER accidentally inherit filters from an unrelated previous question.

For example:

Previous:
"Find Microsoft alumni with Java experience."

New:
"Find jobs in Pune requiring React."

The new request MUST NOT contain:
companyName = Microsoft
areaOfExpertise = Java

It is a completely new search.

If the user says CSE, interpret it as Computer Science.

If the user says IT, interpret it as Information Technology.

If the user asks for upcoming events, use upcomingOnly=true.

Never invent database information.

Never expose sensitive information such as mobile numbers or dates of birth.

The tools are read-only.

Keep responses concise and useful.
`;

/*
|--------------------------------------------------------------------------
| TOOL 1: SEARCH ALUMNI
|--------------------------------------------------------------------------
*/

const searchAlumniTool = {
  type: "function",

  name: "search_alumni",

  description:
    "Search the alumni directory using name, passout year, department, current location, company name, or area of expertise.",

  parameters: {
    type: "object",

    properties: {
      name: {
        type: "string",
        description: "Alumni name.",
      },

      passoutYear: {
        type: "integer",
        description: "Year in which the alumni graduated.",
      },

      department: {
        type: "string",
        description:
          "Department such as Computer Science, CSIT, Information Technology, Civil, Mechanical, Electrical, or Electronics & Telecommunication.",
      },

      currentLocation: {
        type: "string",
        description: "Current city or location of the alumni.",
      },

      companyName: {
        type: "string",
        description: "Current company of the alumni.",
      },

      areaOfExpertise: {
        type: "string",
        description: "Area of expertise or technical skill.",
      },

      limit: {
        type: "integer",
        description: "Maximum number of results. Maximum 20.",
      },

      refinePrevious: {
        type: "boolean",
        description:
          "Set true when this is a follow-up/refinement of the previous alumni search. Set false for a completely new search.",
      },
    },

    required: [],
  },
};

/*
|--------------------------------------------------------------------------
| TOOL 2: SEARCH JOBS
|--------------------------------------------------------------------------
*/

const searchJobsTool = {
  type: "function",

  name: "search_jobs",

  description:
    "Search jobs posted in the alumni portal using title, company, location, job type, skill, or a general search term.",

  parameters: {
    type: "object",

    properties: {
      title: {
        type: "string",
        description: "Job title.",
      },

      companyName: {
        type: "string",
        description: "Company offering the job.",
      },

      location: {
        type: "string",
        description: "Job location.",
      },

      jobType: {
        type: "string",
        description:
          "Job type such as FULL_TIME, PART_TIME, INTERNSHIP, or CONTRACT.",
      },

      skill: {
        type: "string",
        description: "Required skill.",
      },

      search: {
        type: "string",
        description:
          "General search term for title, company, location, description, or skills.",
      },

      limit: {
        type: "integer",
        description: "Maximum number of jobs to return. Maximum 20.",
      },

      refinePrevious: {
        type: "boolean",
        description:
          "Set true only when this is a follow-up to the previous job search. Set false for a new job search.",
      },
    },

    required: [],
  },
};

/*
|--------------------------------------------------------------------------
| TOOL 3: FIND MENTORS
|--------------------------------------------------------------------------
*/

const findMentorsTool = {
  type: "function",

  name: "find_mentors",

  description:
    "Find available alumni mentors based on name, expertise, mentorship topic, preferred mode, current location, or minimum years of experience.",

  parameters: {
    type: "object",

    properties: {
      name: {
        type: "string",
        description: "Mentor name.",
      },

      expertise: {
        type: "string",
        description: "Mentor expertise.",
      },

      mentorshipTopic: {
        type: "string",
        description: "Topic for which mentorship is required.",
      },

      preferredMode: {
        type: "string",
        description: "Mentorship mode: ONLINE, OFFLINE, or BOTH.",
      },

      currentLocation: {
        type: "string",
        description: "Current location of the mentor.",
      },

      minExperience: {
        type: "number",
        description: "Minimum years of professional experience.",
      },

      limit: {
        type: "integer",
        description: "Maximum number of mentors to return. Maximum 20.",
      },

      refinePrevious: {
        type: "boolean",
        description:
          "Set true only when this is a follow-up to the previous mentor search. Set false for a new mentor search.",
      },
    },

    required: [],
  },
};

/*
|--------------------------------------------------------------------------
| TOOL 4: SEARCH EVENTS
|--------------------------------------------------------------------------
*/

const searchEventsTool = {
  type: "function",

  name: "search_events",

  description:
    "Search alumni portal events using title, event type, location, date, or upcoming events.",

  parameters: {
    type: "object",

    properties: {
      title: {
        type: "string",
        description: "Event title.",
      },

      eventType: {
        type: "string",
        description: "Type of event.",
      },

      location: {
        type: "string",
        description: "Event location.",
      },

      date: {
        type: "string",
        description: "Event date in YYYY-MM-DD format.",
      },

      upcomingOnly: {
        type: "boolean",
        description: "Whether to return only upcoming events.",
      },

      limit: {
        type: "integer",
        description: "Maximum number of events to return. Maximum 20.",
      },

      refinePrevious: {
        type: "boolean",
        description:
          "Set true only when this is a follow-up to the previous event search. Set false for a new event search.",
      },
    },

    required: [],
  },
};

/*
|--------------------------------------------------------------------------
| TOOL 5: ALUMNI CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

const getAlumniContributionsTool = {
  type: "function",

  name: "get_alumni_contributions",

  description:
    "Find alumni contribution rankings based on jobs posted, mentoring, mentorship requests, accepted mentorship requests, and event participation.",

  parameters: {
    type: "object",

    properties: {
      name: {
        type: "string",
        description: "Alumni name.",
      },

      passoutYear: {
        type: "integer",
        description: "Alumni passout year.",
      },

      department: {
        type: "string",
        description: "Alumni department.",
      },

      limit: {
        type: "integer",
        description: "Maximum number of alumni to return. Maximum 20.",
      },

      refinePrevious: {
        type: "boolean",
        description:
          "Set true only when this is a follow-up to the previous contribution search. Set false for a new contribution search.",
      },
    },

    required: [],
  },
};

/*
|--------------------------------------------------------------------------
| ALL OPENAI TOOLS
|--------------------------------------------------------------------------
*/

const OPENAI_TOOLS = [
  searchAlumniTool,
  searchJobsTool,
  findMentorsTool,
  searchEventsTool,
  getAlumniContributionsTool,
];

/*
|--------------------------------------------------------------------------
| REMOVE INTERNAL AI CONTROL FIELDS
|--------------------------------------------------------------------------
*/

const cleanToolArguments = (toolArguments) => {
  const cleaned = {
    ...toolArguments,
  };

  delete cleaned.refinePrevious;

  return cleaned;
};

/*
|--------------------------------------------------------------------------
| CHECK MEANINGFUL VALUE
|--------------------------------------------------------------------------
*/

const hasMeaningfulValue = (value) => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "string" && value.trim() === "") {
    return false;
  }

  return true;
};

/*
|--------------------------------------------------------------------------
| MERGE PREVIOUS FILTERS
|--------------------------------------------------------------------------
|
| Only meaningful values from the current request are allowed
| to overwrite previous filters.
|
| Example:
|
| Previous:
| {
|   companyName: "Microsoft",
|   areaOfExpertise: "Java"
| }
|
| Current:
| {
|   currentLocation: "Ahmedabad",
|   companyName: null
| }
|
| Result:
| {
|   companyName: "Microsoft",
|   areaOfExpertise: "Java",
|   currentLocation: "Ahmedabad"
| }
|
|--------------------------------------------------------------------------
*/

const mergeMeaningfulFilters = (previousFilters = {}, currentFilters = {}) => {
  const merged = {
    ...previousFilters,
  };

  for (const [key, value] of Object.entries(currentFilters)) {
    if (hasMeaningfulValue(value)) {
      merged[key] = value;
    }
  }

  return merged;
};

/*
|--------------------------------------------------------------------------
| EXECUTE SELECTED TOOL
|--------------------------------------------------------------------------
*/

const executeTool = async (toolName, toolArguments, previousContext) => {
  switch (toolName) {
    case "search_alumni":
      return await searchAlumni({
        ...toolArguments,

        /*
        |--------------------------------------------------------------------------
        | Restrict follow-up searches to previous alumni results
        |--------------------------------------------------------------------------
        */

        withinIds:
          previousContext?.tool === "search_alumni"
            ? previousContext.resultIds || []
            : [],
      });

    case "search_jobs":
      return await searchJobs(toolArguments);

    case "find_mentors":
      return await findMentors(toolArguments);

    case "search_events":
      return await searchEvents(toolArguments);

    case "get_alumni_contributions":
      return await getAlumniContributions(toolArguments);

    default:
      throw new Error(`Unknown tool selected: ${toolName}`);
  }
};

/*
|--------------------------------------------------------------------------
| FORMAT SALARY
|--------------------------------------------------------------------------
*/

const formatSalary = (salary) => {
  if (!salary) {
    return "";
  }

  const min = salary.min;
  const max = salary.max;
  const currency = salary.currency || "";
  const period = salary.period || "";

  if (min && max) {
    return `${currency} ${min} - ${max} (${period})`;
  }

  if (min) {
    return `${currency} ${min} (${period})`;
  }

  if (max) {
    return `${currency} ${max} (${period})`;
  }

  return "";
};

/*
|--------------------------------------------------------------------------
| FORMAT ALUMNI
|--------------------------------------------------------------------------
*/

const formatAlumniResponse = (result) => {
  if (!result?.success) {
    return "I was unable to search the alumni directory right now.";
  }

  if (result.count === 0) {
    return "I couldn't find any alumni matching those criteria.";
  }

  let response = `I found ${result.count} matching alumni:\n\n`;

  result.alumni.forEach((alumni, index) => {
    response += `${index + 1}. ${alumni.name}`;

    if (alumni.passoutYear) {
      response += ` — ${alumni.passoutYear}`;
    }

    if (alumni.department) {
      response += ` — ${alumni.department}`;
    }

    if (alumni.currentLocation) {
      response += `\n Location: ${alumni.currentLocation}`;
    }

    if (alumni.companyName) {
      response += `\n Company: ${alumni.companyName}`;
    }

    if (
      Array.isArray(alumni.areaOfExpertise) &&
      alumni.areaOfExpertise.length > 0
    ) {
      response += `\n Expertise: ` + alumni.areaOfExpertise.join(", ");
    }

    if (alumni.linkedinUrl) {
      response += `\n LinkedIn: ${alumni.linkedinUrl}`;
    }

    response += "\n\n";
  });

  return response.trim();
};

/*
|--------------------------------------------------------------------------
| FORMAT JOBS
|--------------------------------------------------------------------------
*/

const formatJobsResponse = (result) => {
  if (!result?.success) {
    return "I was unable to search for jobs right now.";
  }

  if (result.count === 0) {
    return "I couldn't find any jobs matching those criteria.";
  }

  let response = `I found ${result.count} matching jobs:\n\n`;

  result.jobs.forEach((job, index) => {
    response += `${index + 1}. ${job.title}`;

    if (job.companyName) {
      response += ` — ${job.companyName}`;
    }

    if (job.location) {
      response += `\n Location: ${job.location}`;
    }

    if (job.jobType) {
      response += `\n Type: ${job.jobType}`;
    }

    if (Array.isArray(job.skills) && job.skills.length > 0) {
      response += `\n Skills: ${job.skills.join(", ")}`;
    }

    if (job.experience) {
      response += `\n Experience: ${job.experience}`;
    }

    if (job.salary) {
      response += `\n Salary: ${formatSalary(job.salary)}`;
    }

    if (job.applicationLink) {
      response += `\n Apply: ${job.applicationLink}`;
    }

    response += "\n\n";
  });

  return response.trim();
};

/*
|--------------------------------------------------------------------------
| FORMAT MENTORS
|--------------------------------------------------------------------------
*/

const formatMentorResponse = (result) => {
  if (!result?.success) {
    return "I was unable to search for mentors right now.";
  }

  if (result.count === 0) {
    return "I couldn't find any mentors matching those criteria.";
  }

  let response = `I found ${result.count} matching mentor${
    result.count === 1 ? "" : "s"
  }:\n\n`;

  result.mentors.forEach((mentor, index) => {
    response += `${index + 1}. ${mentor.name}`;

    if (mentor.department) {
      response += ` — ${mentor.department}`;
    }

    if (mentor.passoutYear) {
      response += ` — ${mentor.passoutYear}`;
    }

    if (mentor.currentLocation) {
      response += `\n Location: ${mentor.currentLocation}`;
    }

    if (mentor.companyName) {
      response += `\n Company: ${mentor.companyName}`;
    }

    if (Array.isArray(mentor.expertise) && mentor.expertise.length > 0) {
      response += `\n Expertise: ` + mentor.expertise.join(", ");
    }

    if (
      Array.isArray(mentor.mentorshipTopics) &&
      mentor.mentorshipTopics.length > 0
    ) {
      response += `\n Mentorship Topics: ` + mentor.mentorshipTopics.join(", ");
    }

    if (mentor.yearsOfExperience !== undefined) {
      response += `\n Experience: ${mentor.yearsOfExperience} years`;
    }

    if (mentor.preferredMode) {
      response += `\n Mode: ${mentor.preferredMode}`;
    }

    if (mentor.linkedinUrl) {
      response += `\n LinkedIn: ${mentor.linkedinUrl}`;
    }

    response += "\n\n";
  });

  return response.trim();
};

/*
|--------------------------------------------------------------------------
| FORMAT EVENTS
|--------------------------------------------------------------------------
*/

const formatEventResponse = (result) => {
  if (!result?.success) {
    return "I was unable to search for events right now.";
  }

  if (result.count === 0) {
    return "I couldn't find any events matching those criteria.";
  }

  let response = `I found ${result.count} matching event${
    result.count === 1 ? "" : "s"
  }:\n\n`;

  result.events.forEach((event, index) => {
    response += `${index + 1}. ${event.title}`;

    if (event.eventType) {
      response += ` — ${event.eventType}`;
    }

    if (event.date) {
      response += `\n Date: ${new Date(event.date).toLocaleDateString(
        "en-IN",
      )}`;
    }

    if (event.time) {
      response += `\n Time: ${event.time}`;
    }

    if (event.location) {
      response += `\n Location: ${event.location}`;
    }

    if (event.description) {
      response += `\n Description: ${event.description}`;
    }

    if (event.registrationRequired) {
      response += "\n Registration: Required";

      if (event.registrationDeadline) {
        response +=
          `\n Registration Deadline: ` +
          `${new Date(event.registrationDeadline).toLocaleDateString("en-IN")}`;
      }
    }

    if (event.registrationCount !== undefined) {
      response += `\n Registered: ${event.registrationCount}`;
    }

    response += "\n\n";
  });

  return response.trim();
};

/*
|--------------------------------------------------------------------------
| FORMAT CONTRIBUTIONS
|--------------------------------------------------------------------------
*/

const formatContributionResponse = (result) => {
  if (!result?.success) {
    return "I was unable to retrieve alumni contribution information.";
  }

  if (result.count === 0) {
    return "I couldn't find any contribution records matching those criteria.";
  }

  let response = `Here are the top contributing alumni:\n\n`;

  result.contributions.forEach((alumni, index) => {
    response += `${index + 1}. ${alumni.name}`;

    if (alumni.passoutYear) {
      response += ` — ${alumni.passoutYear}`;
    }

    if (alumni.department) {
      response += ` — ${alumni.department}`;
    }

    if (alumni.currentLocation) {
      response += `\n Location: ${alumni.currentLocation}`;
    }

    if (alumni.companyName) {
      response += `\n Company: ${alumni.companyName}`;
    }

    response += `\n Jobs Posted: ${alumni.jobsPosted}`;
    response += `\n Mentor: ${alumni.mentor ? "Yes" : "No"}`;
    response += `\n Mentorship Requests Received: ${alumni.mentorshipRequestsReceived}`;
    response += `\n Mentorship Requests Accepted: ${alumni.mentorshipRequestsAccepted}`;
    response += `\n Event Registrations: ${alumni.eventRegistrations}`;
    response += `\n Total Contributions: ${alumni.totalContributions}`;

    response += "\n\n";
  });

  return response.trim();
};

/*
|--------------------------------------------------------------------------
| FORMAT TOOL RESULT
|--------------------------------------------------------------------------
*/

const formatToolResponse = (toolName, result) => {
  switch (toolName) {
    case "search_alumni":
      return formatAlumniResponse(result);

    case "search_jobs":
      return formatJobsResponse(result);

    case "find_mentors":
      return formatMentorResponse(result);

    case "search_events":
      return formatEventResponse(result);

    case "get_alumni_contributions":
      return formatContributionResponse(result);

    default:
      return "I found the requested information.";
  }
};

/*
|--------------------------------------------------------------------------
| RUN ALUMNI AGENT
|--------------------------------------------------------------------------
*/

export const runAlumniAgent = async (userMessage, previousContext = null) => {
  try {
    console.log("\n========================================");
    console.log("ALUMNI AI AGENT");
    console.log("========================================");

    console.log("User message:", userMessage);
    console.log("Previous context:", previousContext);

    /*
    |--------------------------------------------------------------------------
    | BUILD CONTEXT INFORMATION FOR OPENAI
    |--------------------------------------------------------------------------
    */

    let contextInstruction = `
There is no previous search context available.

Treat the current user message as a new request unless the
message itself clearly contains enough information to answer
without previous context.
`;

    if (previousContext?.tool) {
      contextInstruction = `
PREVIOUS SEARCH CONTEXT:

Tool:
${previousContext.tool}

Previous filters:
${JSON.stringify(previousContext.filters || {}, null, 2)}

Previous result count:
${previousContext.resultIds?.length || 0}

IMPORTANT:
Decide whether the current user message is a follow-up to this previous search.

If it is a follow-up:
- set refinePrevious = true
- preserve relevant previous filters
- add or change only what the user asks for
- if the user says "them", "those", "these", "above", or similar wording,
  keep the previous result set as the scope

If it is a completely new question:
- set refinePrevious = false
- do not carry over unrelated previous filters
- start a completely new search
`;
    }

    /*
    |--------------------------------------------------------------------------
    | STEP 1
    | OpenAI decides which tool to use.
    |
    | IMPORTANT:
    | This is the ONLY OpenAI API request.
    |--------------------------------------------------------------------------
    */

    const response = await openai.responses.create({
      model: "gpt-6-luna",

      instructions: SYSTEM_INSTRUCTION,

      input: `
${contextInstruction}

CURRENT USER MESSAGE:
${userMessage}
`,

      tools: OPENAI_TOOLS,

      tool_choice: "auto",

      parallel_tool_calls: false,
    });

    /*
    |--------------------------------------------------------------------------
    | STEP 2
    | Find function call
    |--------------------------------------------------------------------------
    */

    const functionCall = response.output?.find(
      (item) => item.type === "function_call",
    );

    /*
    |--------------------------------------------------------------------------
    | No tool selected
    |--------------------------------------------------------------------------
    */

    if (!functionCall) {
      return {
        success: true,

        response: response.output_text || "I couldn't understand your request.",

        toolUsed: null,

        toolArguments: null,

        resultCount: null,

        activeContext: null,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | STEP 3
    | Get selected tool and arguments
    |--------------------------------------------------------------------------
    */

    const toolName = functionCall.name;

    let rawArguments = functionCall.arguments || {};

    /*
    |--------------------------------------------------------------------------
    | Safely parse arguments
    |--------------------------------------------------------------------------
    */

    if (typeof rawArguments === "string") {
      try {
        rawArguments = JSON.parse(rawArguments);
      } catch (error) {
        console.error("Tool argument parsing error:", error);

        return {
          success: false,

          response: "I couldn't understand the search criteria.",

          toolUsed: toolName,

          toolArguments: rawArguments,

          resultCount: null,
        };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Determine whether this is a follow-up
    |--------------------------------------------------------------------------
    */

    const refinePrevious = rawArguments.refinePrevious === true;

    /*
    |--------------------------------------------------------------------------
    | Remove internal AI control field
    |--------------------------------------------------------------------------
    */

    let toolArguments = cleanToolArguments(rawArguments);

    console.log("OpenAI selected tool:", toolName);

    console.log("Refine previous:", refinePrevious);

    console.log("OpenAI arguments:", toolArguments);

    /*
    |--------------------------------------------------------------------------
    | Determine whether previous context can actually be used
    |--------------------------------------------------------------------------
    */

    const sameTool = previousContext && previousContext.tool === toolName;

    const shouldRefine = refinePrevious === true && sameTool;

    /*
    |--------------------------------------------------------------------------
    | Merge previous filters only for a valid follow-up
    |--------------------------------------------------------------------------
    */

    if (shouldRefine) {
      toolArguments = mergeMeaningfulFilters(
        previousContext.filters || {},
        toolArguments,
      );
    }

    console.log("Should refine previous:", shouldRefine);

    console.log("Final tool arguments:", toolArguments);

    /*
    |--------------------------------------------------------------------------
    | STEP 4
    | Execute selected backend tool
    |--------------------------------------------------------------------------
    */

    const contextForTool = shouldRefine ? previousContext : null;

    const toolResult = await executeTool(
      toolName,
      toolArguments,
      contextForTool,
    );

    console.log("Tool result count:", toolResult?.count);

    /*
    |--------------------------------------------------------------------------
    | STEP 5
    | Format response in backend.
    |
    | IMPORTANT:
    |
    | We still make only ONE OpenAI request.
    |--------------------------------------------------------------------------
    */

    const finalResponse = formatToolResponse(toolName, toolResult);

    /*
    |--------------------------------------------------------------------------
    | STEP 6
    | Build new active context
    |--------------------------------------------------------------------------
    */

    let activeContext = null;

    /*
    |--------------------------------------------------------------------------
    | Alumni context
    |--------------------------------------------------------------------------
    */

    if (toolName === "search_alumni" && toolResult?.success) {
      activeContext = {
        tool: "search_alumni",

        filters: toolResult.filters || toolArguments,

        resultIds: Array.isArray(toolResult.alumni)
          ? toolResult.alumni
              .map((alumni) => alumni._id?.toString())
              .filter(Boolean)
          : [],
      };
    } else if (toolResult?.success) {
      /*
      |--------------------------------------------------------------------------
      | Other tool contexts
      |--------------------------------------------------------------------------
      */

      activeContext = {
        tool: toolName,

        filters: toolResult.filters || toolArguments,

        resultIds: [],
      };
    }

    /*
    |--------------------------------------------------------------------------
    | STEP 7
    |--------------------------------------------------------------------------
    */

    return {
      success: true,

      response: finalResponse,

      toolUsed: toolName,

      toolArguments,

      resultCount: typeof toolResult?.count === "number" ? toolResult.count : 0,

      activeContext,
    };
  } catch (error) {
    console.error("Alumni Agent Error:", error);

    /*
    |--------------------------------------------------------------------------
    | OPENAI RATE LIMIT
    |--------------------------------------------------------------------------
    */

    if (error?.status === 429 || error?.statusCode === 429) {
      return {
        success: false,

        response:
          "The AI service has temporarily reached its request limit. Please try again later.",

        error: "OPENAI_RATE_LIMIT",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | GENERAL ERROR
    |--------------------------------------------------------------------------
    */

    return {
      success: false,

      response: "Sorry, I was unable to process your request right now.",

      error: error?.message,
    };
  }
};

export default runAlumniAgent;
