// /api/ai-generate.js
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const requestPrompt = `
You are an AI website builder agent. When generating a website/game based on the request, do the following:
1. Provide a chat message with only the essential additions the user needs to implement:
   - <style> blocks
   - <script> blocks
   - <img> tags
2. Provide the full working HTML, CSS, JS for the live preview.
3. Clearly separate code blocks using triple backticks and language (html, css, javascript).
Request:
${prompt}
`;

    const result = await model.generateContent(requestPrompt);

    const fullOutput = result.response.text();

    // Extract minimal additions for chat (style, script, img)
    const chatMatches = [...fullOutput.matchAll(/```(?:html|css|javascript)?\s*([\s\S]*?)```/gi)];
    const chatOutput = chatMatches.map(match => {
      // Filter only essential tags for chat
      const essential = match[1]
        .split("\n")
        .filter(line => /<style|<script|<img/.test(line))
        .join("\n");
      return essential;
    }).join("\n");

    res.status(200).json({
      output: fullOutput,  // for live preview
      chat: chatOutput     // for dashboard chat
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
}
