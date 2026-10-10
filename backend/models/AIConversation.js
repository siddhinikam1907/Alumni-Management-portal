import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const aiConversationSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Conversation ID
    |--------------------------------------------------------------------------
    |
    | This conversation belongs to one chatbot session.
    |
    */

    messages: {
      type: [messageSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | Active Context
    |--------------------------------------------------------------------------
    |
    | Stores the context of the LAST meaningful search.
    |
    | Example:
    |
    | tool: "search_alumni"
    |
    | filters:
    | {
    |   companyName: "Microsoft",
    |   areaOfExpertise: "Java"
    | }
    |
    | resultIds:
    | [
    |   "...",
    |   "..."
    | ]
    |
    */

    activeContext: {
      tool: {
        type: String,
        default: null,
      },

      filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      resultIds: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Last tool information
    |--------------------------------------------------------------------------
    */

    lastToolUsed: {
      type: String,
      default: null,
    },

    lastToolArguments: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const AIConversation = mongoose.model("AIConversation", aiConversationSchema);

export default AIConversation;
