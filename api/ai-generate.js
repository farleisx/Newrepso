import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, previousCode } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let requestPrompt = "";
    if (previousCode) {
      requestPrompt = `
You are an AI website builder agent. You have the following existing code:
${previousCode}

The user wants to update or add features according to:
"${prompt}"

Rules:
1. Generate code in HTML, CSS, JS, or any language needed.
2. Wrap all code in proper markdown blocks with language tags: \`\`\`html\`\`\`, \`\`\`css\`\`\`, \`\`\`javascript\`\`\`.
3. Only return updated code (no explanations outside comments).
`;
    } else {
      requestPrompt = `
You are an AI website builder agent.
Generate a FULL working website for this request:
"${prompt}"

Rules:
1. Generate code in HTML, CSS, JS, or any language needed.
2. Wrap all code in proper markdown blocks with language tags: \`\`\`html\`\`\`, \`\`\`css\`\`\`, \`\`\`javascript\`\`\`.
3. HTML must be complete (<html>, <head>, <body>).
`;
    }

    const result = await model.generateContent(requestPrompt);
    const fullOutput = await result.response.text(); // ✅ fixed await

    if (!fullOutput || fullOutput.trim() === "") {
      return res.status(500).json({ error: "AI returned empty output" });
    }

    res.status(200).json({ output: fullOutput });

  } catch (err) {
    console.error("AI request failed:", err);
    res.status(500).json({ error: "AI request failed" });
  }
}
