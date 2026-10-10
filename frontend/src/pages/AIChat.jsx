import {
  ArrowLeft,
  Bot,
  CalendarDays,
  BriefcaseBusiness,
  GraduationCap,
  Loader2,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";

const suggestions = [
  {
    icon: Users,
    title: "Find Alumni",
    prompt: "Find alumni who passed out in 2022.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Find Jobs",
    prompt: "Find Java jobs in Pune.",
  },
  {
    icon: GraduationCap,
    title: "Find Mentors",
    prompt:
      "Find Java mentors with at least 3 years of experience who are available online.",
  },
  {
    icon: CalendarDays,
    title: "Upcoming Events",
    prompt: "Show me upcoming alumni events.",
  },
];

function AIChat() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Conversation ID
  |--------------------------------------------------------------------------
  |
  | The backend creates this ID when the first message is sent.
  | Every following message uses the same ID so that the backend
  | can retrieve the previous search context.
  |
  */

  const [conversationId, setConversationId] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | SEND MESSAGE
  |--------------------------------------------------------------------------
  */

  const sendMessage = async (messageText = input) => {
    const message = messageText.trim();

    if (!message || loading) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Add user message to UI immediately
    |--------------------------------------------------------------------------
    */

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | Send request to backend
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      | conversationId is sent with every request.
      |
      | First request:
      | conversationId = null
      |
      | Later requests:
      | conversationId = existing conversation ID
      |
      */

      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          message,
          conversationId,
        }),
      });

      const data = await response.json();

      /*
      |--------------------------------------------------------------------------
      | Handle backend errors
      |--------------------------------------------------------------------------
      */

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to process your request.");
      }

      /*
      |--------------------------------------------------------------------------
      | Save conversation ID
      |--------------------------------------------------------------------------
      |
      | The backend creates the conversation on the first request
      | and returns the conversationId.
      |
      | We store it in React state so all future messages use
      | the same conversation.
      |
      */

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      /*
      |--------------------------------------------------------------------------
      | Add AI response
      |--------------------------------------------------------------------------
      */

      const aiMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        toolUsed: data.toolUsed,
        resultCount: data.resultCount,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);

      /*
      |--------------------------------------------------------------------------
      | Show error inside chat
      |--------------------------------------------------------------------------
      */

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error.message ||
          "Something went wrong while connecting to Alumni AI. Please try again.",
        error: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORM SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  /*
  |--------------------------------------------------------------------------
  | SUGGESTION CLICK
  |--------------------------------------------------------------------------
  */

  const handleSuggestion = (prompt) => {
    sendMessage(prompt);
  };

  /*
  |--------------------------------------------------------------------------
  | START NEW CHAT
  |--------------------------------------------------------------------------
  |
  | Clearing conversationId is important.
  |
  | The next message will be treated as a completely new
  | conversation by the backend.
  |
  */

  const startNewChat = () => {
    if (loading) {
      return;
    }

    setMessages([]);
    setConversationId(null);
    setInput("");
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-2rem)] flex-col">
        {/* Header */}

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
                  <Sparkles size={18} />
                </div>

                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Alumni AI
                </h1>

                <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 sm:inline-flex">
                  ● Online
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Your intelligent alumni network assistant
              </p>
            </div>
          </div>

          {/* New Chat Button */}

          <button
            onClick={startNewChat}
            disabled={loading || messages.length === 0}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            New Chat
          </button>
        </motion.div>

        {/* Chat container */}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Chat messages */}

          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestion={handleSuggestion} />
            ) : (
              <div className="mx-auto w-full max-w-4xl space-y-6 p-5 sm:p-8">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {loading && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* Input area */}

          <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex w-full max-w-4xl items-end gap-3"
            >
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit(event);
                    }
                  }}
                  rows={1}
                  disabled={loading}
                  placeholder="Ask anything about alumni, jobs, mentors or events..."
                  className="max-h-32 min-h-[52px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}
                </button>
              </div>
            </form>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              Press Enter to send • Shift + Enter for a new line
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/*
|--------------------------------------------------------------------------
| WELCOME SCREEN
|--------------------------------------------------------------------------
*/

function WelcomeScreen({ onSuggestion }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-12 sm:px-8">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-200"
      >
        <Sparkles size={30} />
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="mt-5 text-center"
      >
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          How can I help you?
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          Ask me to find alumni, discover job opportunities, connect with
          mentors, explore events, or understand alumni contributions.
        </p>
      </motion.div>

      <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;

          return (
            <motion.button
              key={suggestion.title}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15 + index * 0.07,
              }}
              onClick={() => onSuggestion(suggestion.prompt)}
              className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {suggestion.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {suggestion.prompt}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| CHAT MESSAGE
|--------------------------------------------------------------------------
*/

function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "order-first" : ""}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
            isUser
              ? "rounded-tr-md bg-indigo-600 text-white shadow-sm"
              : message.error
                ? "rounded-tl-md border border-red-100 bg-red-50 text-red-700"
                : "rounded-tl-md border border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        {!isUser && !message.error && message.toolUsed && (
          <div className="mt-2 flex items-center gap-2 px-1">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
              ✨ {formatToolName(message.toolUsed)}
            </span>

            {typeof message.resultCount === "number" && (
              <span className="text-[10px] text-slate-400">
                {message.resultCount} result
                {message.resultCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
          You
        </div>
      )}
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| TYPING INDICATOR
|--------------------------------------------------------------------------
*/

function TypingIndicator() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="flex items-start gap-3"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md">
        <Bot size={18} />
      </div>

      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-slate-200 bg-slate-50 px-4 py-4">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| TOOL NAME
|--------------------------------------------------------------------------
*/

function formatToolName(toolName) {
  const names = {
    search_alumni: "Alumni Search",
    search_jobs: "Job Search",
    find_mentors: "Mentor Search",
    search_events: "Event Search",
    get_alumni_contributions: "Contribution Analysis",
  };

  return names[toolName] || "Alumni AI";
}

export default AIChat;
