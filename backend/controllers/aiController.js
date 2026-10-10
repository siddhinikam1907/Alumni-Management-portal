import { runAlumniAgent } from "../ai/alumniAgent.js";
import AIConversation from "../models/AIConversation.js";

/*
|--------------------------------------------------------------------------
| POST /api/ai/chat
|--------------------------------------------------------------------------
|
| Sends the user's natural-language question to AlumniHub AI.
|
|--------------------------------------------------------------------------
*/

export const chatWithAI = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate message
    |--------------------------------------------------------------------------
    */

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long. Maximum 1000 characters.",
      });
    }

    console.log("\nAI CHAT REQUEST:");
    console.log(trimmedMessage);

    console.log("Conversation ID:", conversationId || "NEW");

    /*
    |--------------------------------------------------------------------------
    | STEP 1
    | Find existing conversation
    |--------------------------------------------------------------------------
    */

    let conversation = null;

    if (conversationId) {
      conversation = await AIConversation.findById(conversationId);
    }

    /*
    |--------------------------------------------------------------------------
    | STEP 2
    | Create new conversation if necessary
    |--------------------------------------------------------------------------
    */

    if (!conversation) {
      conversation = await AIConversation.create({
        messages: [],
        activeContext: {
          tool: null,
          filters: {},
          resultIds: [],
        },
        lastToolUsed: null,
        lastToolArguments: null,
      });

      console.log("Created new conversation:", conversation._id.toString());
    }

    /*
    |--------------------------------------------------------------------------
    | STEP 3
    | Get previous context
    |--------------------------------------------------------------------------
    */

    const previousContext = conversation.activeContext?.tool
      ? {
          tool: conversation.activeContext.tool,

          filters: conversation.activeContext.filters || {},

          resultIds: conversation.activeContext.resultIds || [],
        }
      : null;

    console.log("Previous context:", previousContext);

    /*
    |--------------------------------------------------------------------------
    | STEP 4
    | Run AI agent
    |--------------------------------------------------------------------------
    */

    const result = await runAlumniAgent(trimmedMessage, previousContext);

    /*
    |--------------------------------------------------------------------------
    | Agent-level failure
    |--------------------------------------------------------------------------
    */

    if (!result.success) {
      return res.status(500).json({
        success: false,

        message: result.response || "Unable to process your request.",

        conversationId: conversation._id.toString(),
      });
    }

    /*
    |--------------------------------------------------------------------------
    | STEP 5
    | Save user message
    |--------------------------------------------------------------------------
    */

    conversation.messages.push({
      role: "user",
      content: trimmedMessage,
    });

    /*
    |--------------------------------------------------------------------------
    | STEP 6
    | Save assistant response
    |--------------------------------------------------------------------------
    */

    conversation.messages.push({
      role: "assistant",
      content: result.response,
    });

    /*
    |--------------------------------------------------------------------------
    | STEP 7
    | Update active context
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | If the question is completely new,
    | result.activeContext represents the new search.
    |
    | Therefore old context is replaced.
    |
    |--------------------------------------------------------------------------
    */

    if (result.activeContext) {
      conversation.activeContext = result.activeContext;
    }

    conversation.lastToolUsed = result.toolUsed || null;

    conversation.lastToolArguments = result.toolArguments || null;

    /*
    |--------------------------------------------------------------------------
    | STEP 8
    | Save conversation
    |--------------------------------------------------------------------------
    */

    await conversation.save();

    /*
    |--------------------------------------------------------------------------
    | STEP 9
    | Send response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      response: result.response,

      toolUsed: result.toolUsed || null,

      toolArguments: result.toolArguments || null,

      resultCount:
        typeof result.resultCount === "number" ? result.resultCount : null,

      conversationId: conversation._id.toString(),
    });
  } catch (error) {
    console.error("AI Controller Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong while processing your AI request.",
    });
  }
};
