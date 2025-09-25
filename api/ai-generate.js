import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    // Use Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const requestPrompt = `
You are an AI website builder agent.
Generate a FULL working website/game (HTML, CSS, JS) for this request:
"${prompt}"

Rules:
1. Always return code inside proper \`\`\`html, \`\`\`css, \`\`\`javascript blocks.
2. HTML must be complete (<html>, <head>, <body>).
3. CSS goes inside its own block.
4. JS goes inside its own block.
    `;

    const result = await model.generateContent(requestPrompt);
    const fullOutput = result.response.text();

    // Just return everything (dashboard will handle rendering)
    res.status(200).json({ output: fullOutput });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
}
