import React, { useState } from 'react';
import {
  Agent,
  Action,
  TTS,
  PendingActionEvent,
} from 'react-agents';
import { z } from 'zod';
import dedent from 'dedent';


const quotes = [
  "Nervous? Good! Butterflies mean you're about to fly.",
  "Mistakes are proof that you're trying. Keep going, champ!",
  "Remember, even the best coders started with 'Hello World!'",
  "You’re not just preparing for an interview—you’re leveling up!",
];


const generateQuestions = (role: string, level: string): string[] => {
  const questions = {
    software_engineer: {
      beginner: [
        "What is a variable?",
        "Explain object-oriented programming.",
        "What's the difference between == and ===?",
      ],
      intermediate: [
        "What are design patterns?",
        "Explain garbage collection in Java.",
        "What’s a RESTful API?",
      ],
      advanced: [
        "Design a scalable system for a streaming platform.",
        "Explain the CAP theorem.",
        "Microservices: What’s the good, bad, and ugly?",
      ],
    },
    data_analyst: {
      beginner: [
        "What’s the difference between data and information?",
        "Explain databases.",
        "SQL: Why is it essential?",
      ],
      intermediate: [
        "INNER JOIN vs. OUTER JOIN.",
        "What’s data normalization?",
        "Regression analysis?",
      ],
      advanced: [
        "Large datasets—how do you clean and preprocess them?",
        "Predictive analytics.",
        "Challenges of big data.",
      ],
    },
  };
  return questions[role]?.[level] || ["Oops! No questions available for this role and level."];
};

// Provide feedback
const provideFeedback = (response: string): string => {
  if (!response || response.length < 15) {
    return "Your response is shorter than a tweet! Let's add more details.";
  }
  if (response.includes("I don't know")) {
    return "Not knowing is okay! But next time, give it a shot anyway.";
  }
  return "Great effort! Your answer shows understanding. Keep refining.";
};

export default function MyAgent() {
  const [userContext, setUserContext] = useState<{ role?: string; level?: string }>({});

  return (
    <Agent>
      {/* Text-to-Speech for motivational voice */}
      <TTS voiceEndpoint="elevenlabs:uni:PSAakCTPE63lB4tP9iNQ" />

      {/* Generate questions */}
      <Action
        name="generateQuestions"
        description="Generate interview questions based on role and level."
        schema={z.object({
          role: z.string(),
          level: z.string(),
        })}
        examples={[
          { role: "software_engineer", level: "beginner" },
          { role: "data_analyst", level: "advanced" },
        ]}
        handler={async (event: PendingActionEvent) => {
          const { role, level } = event.data.message.args as { role: string; level: string };
          const questions = generateQuestions(role, level);
          setUserContext({ role, level });

          const motivationalQuote = quotes[Math.floor(Math.random() * quotes.length)];
          const response = dedent`
            Ready for a challenge? Here are your ${level} questions for ${role}:
            ${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
            ${motivationalQuote}
          `;
          await event.data.agent.monologue(response);
          await event.commit();
        }}
      />

      {/* Evaluate user responses */}
      <Action
        name="evaluateResponse"
        description="Evaluate user responses and give feedback."
        schema={z.object({
          response: z.string(),
        })}
        examples={[
          { response: "A variable is a container for storing data values." },
        ]}
        handler={async (event: PendingActionEvent) => {
          const { response } = event.data.message.args as { response: string };
          const feedback = provideFeedback(response);

          const responseMessage = `
            Feedback: ${feedback}
            You're doing great! Remember: Success is just an iteration away.
          `;
          await event.data.agent.monologue(responseMessage);
          await event.commit();
        }}
      />
    </Agent>
  );
}
