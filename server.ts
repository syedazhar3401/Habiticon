/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
    console.warn("GEMINI_API_KEY is not configured or uses placeholder. Running in resilient mock-agent fallback mode.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

// AI Assistant Action endpoint
app.post("/api/assistant", async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Highly resilient local parsing fallback (Regex) for a smooth user experience even without an API key!
    console.log("Processing message utilizing local heuristic regex engine...");
    return res.json(getLocalParserResponse(prompt, context));
  }

  try {
    const formattedCourses = (context?.courses || [])
      .map((c: any) => `- ID: ${c.id}, Code: ${c.code}, Name: ${c.name}`)
      .join("\n");

    const formattedTasks = (context?.tasks || [])
      .map((t: any) => `- Title: ${t.title}, Course: ${t.courseId || "None"}, Status: ${t.status}, Deadline: ${t.deadline}`)
      .join("\n");

    const formattedEvents = (context?.events || [])
      .map((e: any) => `- Title: ${e.title}, Course: ${e.courseId || "None"}, Date: ${e.date}, Time: ${e.startTime}-${e.endTime}`)
      .join("\n");

    const systemInstruction = `You are "Aura", the Campus Task Manager AI Academic Assistant, a friendly, supportive companion for university students.
Your job is to read the student's message and answer their inquiries about workload management, assignments, or courses.
Moreover, you are capable of automatically recommending or issuing structured database actions!
You MUST analyze if they are describing a class to schedule, a task to remember, a note course folder to set up, or wanting to navigate the app.

Here is the student's current workspace data context:
COURSES (Active):
${formattedCourses || "No courses available."}

TASKS (Active):
${formattedTasks || "No tasks active."}

EVENTS (Active):
${formattedEvents || "No upcoming schedule events."}

Today's Date: 2026-05-30. If the user says "Today", "this Tuesday", etc., calculate the target date relative to May 30, 2026.
For example, Monday of this week is June 1, 2026, or Tuesday is June 2, 2026, etc. Or assume standard calendar months (June/July 2026).
If they mention an assignment due on a specific month (like "July 29"), output target date as "2026-07-29".

If they ask to add, create, or schedule something:
- Create a Task: If they want to add a homework, assignment, or study task. Formulate high, medium, or low priority.
- Create an Event: If they want to schedule a class, exam, study session, or student meeting.
- Create a Note Folder/Note: If they mention notes, software folders, folder creations.
- Navigate Views: If they say "show calendars", "take me to notes", "open Gantt", "show dashboard", "go to blueprint".

Your response MUST conform to the structured JSON schema provided. Expand your explanations or encouragement in the 'reply' field using markdown headers, quotes, lists, or motivational study tips. No self-mentions of code structures or JSON files. Keep descriptions professional and delightful!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Elegant academic response supporting the user. Detailed list of steps, answers, or study plan recommendations. Markdown supported."
            },
            actions: {
              type: Type.ARRAY,
              description: "Extracted transactional commands",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "Action type: 'create_event', 'create_task', 'create_note', 'show_view'"
                  },
                  label: {
                    type: Type.STRING,
                    description: "Button text to confirm the action, e.g., 'Schedule WIX1003 Exam on July 10'"
                  },
                  payload: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Title of task, event, or note folder" },
                      courseId: { type: Type.STRING, description: "Matching Course ID from context (e.g. course-1, course-2) if applicable" },
                      date: { type: Type.STRING, description: "Event date in format YYYY-MM-DD" },
                      startTime: { type: Type.STRING, description: "Event start HH:MM" },
                      endTime: { type: Type.STRING, description: "Event end HH:MM" },
                      priority: { type: Type.STRING, description: "'low' | 'medium' | 'high' for tasks" },
                      deadline: { type: Type.STRING, description: "Task deadline in format YYYY-MM-DD" },
                      estimatedHours: { type: Type.INTEGER, description: "Time to complete" },
                      category: { type: Type.STRING, description: "For events: 'class'|'exam'|'meeting'|'study_session'|'other'" },
                      location: { type: Type.STRING, description: "Location" },
                      description: { type: Type.STRING, description: "Event/Task description" },
                      view: { type: Type.STRING, description: "For show_view: 'dashboard'|'calendar'|'tasks'|'courses'|'notes'|'gantt'|'blueprint'" },
                      content: { type: Type.STRING, description: "For notes content markdown" },
                      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Note tags" }
                    }
                  }
                },
                required: ["type", "label", "payload"]
              }
            }
          },
          required: ["reply", "actions"]
        }
      }
    });

    const bodyText = response.text || "{}";
    const resultObj = JSON.parse(bodyText.trim());
    return res.json(resultObj);
  } catch (error: any) {
    console.error("Gemini Assistant error:", error);
    return res.status(500).json({
      reply: `I encountered an issue processing that call with Gemini, but I can assist you directly! Let me know if you need to create a custom task, and I'll walk you through standard creations manually.`,
      actions: []
    });
  }
});

/**
 * Resilient mock regex parser if GEMINI_API_KEY is not filled yet
 */
function getLocalParserResponse(prompt: string, context: any) {
  const normalized = prompt.toLowerCase();
  const replyLines = [];
  const actions = [];

  // Course matcher helper
  const courses = context?.courses || [];
  const findCourse = (text: string) => {
    return courses.find(
      (c: any) =>
        text.includes(c.code.toLowerCase()) ||
        text.includes(c.name.toLowerCase())
    );
  };
  const matchedCourse = findCourse(normalized);

  replyLines.push(`### Aura Assistant Heuristic Engine Active`);
  replyLines.push(`I am running in **Resilience Mode** (API Key Pending). I have parsed your command using local semantic rules:`);

  // 1. Assignment command
  // "assignment due on July 29 for WIX1003. Add to my calendar and task list."
  if (normalized.includes("assignment") || normalized.includes("due") || normalized.includes("task")) {
    let deadline = "2026-07-29";
    const dateMatch = normalized.match(/due(?: on)?\s+([a-zA-Z]+)\s+(\d+)/);
    if (dateMatch) {
      const month = dateMatch[1];
      const day = dateMatch[2].padStart(2, "0");
      const monthNum = month.startsWith("jun") ? "06" : month.startsWith("jul") ? "07" : "08";
      deadline = `2026-${monthNum}-${day}`;
    }

    const title = matchedCourse
      ? `Assignment for ${matchedCourse.code}`
      : "New academic assignment";

    replyLines.push(`- **Action Recognized**: Creating an assignment task/deadline for \`${deadline}\`.`);

    actions.push({
      type: "create_task",
      label: `Confirm Task: "${title}" due ${deadline}`,
      payload: {
        title,
        courseId: matchedCourse?.id || "course-1",
        deadline,
        priority: "high",
        estimatedHours: 4,
        description: `Created via natural prompt: "${prompt}"`,
        status: "not_started"
      }
    });

    actions.push({
      type: "create_event",
      label: `Confirm Calendar Deadline: "${title}"`,
      payload: {
        title: `Deadline: ${title}`,
        courseId: matchedCourse?.id || "course-1",
        date: deadline,
        startTime: "23:59",
        endTime: "23:59",
        location: "Online Portal",
        category: "exam",
        recurring: "none",
        reminderMinutes: 1440,
        description: "Assignment submission deadline."
      }
    });
  }

  // 2. Study Session match
  // "Create a study session for Computer Science every Tuesday at 6 PM"
  if (normalized.includes("study") || normalized.includes("session")) {
    const timeMatch = normalized.match(/at\s+(\d+)\s*(pm|am)?/);
    let startTime = "18:00";
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      if (timeMatch[2] === "pm" && hour < 12) hour += 12;
      startTime = `${hour.toString().padStart(2, "0")}:00`;
    }

    const title = matchedCourse
      ? `Study Session: ${matchedCourse.name}`
      : "General Study Session";

    replyLines.push(`- **Action Recognized**: Scheduling periodic study session for Tuesdays at ${startTime}.`);

    actions.push({
      type: "create_event",
      label: `Confirm Weekly Event: "${title}"`,
      payload: {
        title,
        courseId: matchedCourse?.id || "course-1",
        date: "2026-06-02", // First Tuesday
        startTime,
        endTime: "19:30",
        location: "Campus Library / Zoom",
        category: "study_session",
        recurring: "weekly",
        reminderMinutes: 30,
        description: "Recurring weekly discussion and study review."
      }
    });
  }

  // 3. Folders/Notes match
  // "Create a note folder for Software Engineering"
  if (normalized.includes("note") || normalized.includes("folder")) {
    const title = matchedCourse
      ? matchedCourse.name
      : "Software Engineering";

    replyLines.push(`- **Action Recognized**: Creating customized knowledge workspace folder for Software Engineering.`);

    actions.push({
      type: "create_note",
      label: `Confirm Note Folder: "${title}"`,
      payload: {
        title: `Lecture 1 Outline`,
        content: `# ${title} Notes\n\nIntroductory class structure and lecture summaries goes here.`,
        courseId: matchedCourse?.id || "course-2",
        tags: ["intro", "notes"]
      }
    });
  }

  // 4. View shifting
  if (normalized.includes("gantt") || normalized.includes("timeline")) {
    actions.push({
      type: "show_view",
      label: "Navigate to Gantt Timeline view",
      payload: { view: "gantt" }
    });
  } else if (normalized.includes("calendar")) {
    actions.push({
      type: "show_view",
      label: "Navigate to Full Calendar",
      payload: { view: "calendar" }
    });
  } else if (normalized.includes("note") && !normalized.includes("folder")) {
    actions.push({
      type: "show_view",
      label: "Navigate to Notes Book",
      payload: { view: "notes" }
    });
  } else if (normalized.includes("blueprint") || normalized.includes("spec") || normalized.includes("prd")) {
    actions.push({
      type: "show_view",
      label: "Navigate to Engineering Blueprint",
      payload: { view: "blueprint" }
    });
  }

  if (actions.length === 0) {
    replyLines.push(`I can help you build study schedules, plan exams, organize Kanban columns, and draft notion-style notes. Prompt me with commands like:`);
    replyLines.push(`* *"Add assignment due July 29 for WIX1003"*`);
    replyLines.push(`* *"Create a study session for Software Engineering every Tuesday at 6 PM"*`);
    replyLines.push(`* *"Create a note folder for Computer Science"*`);
  } else {
    replyLines.push(`\nReview the action items parsed. Click **Confirm** on any recommended action above to immediately execute it in your Workspace!`);
  }

  return {
    reply: replyLines.join("\n"),
    actions
  };
}

// Vite Dev Server / Static Ingress configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware registered successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Campus Task Manager server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
