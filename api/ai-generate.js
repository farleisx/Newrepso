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
      // If there is existing code, instruct AI to update it
      requestPrompt = `
You are an AI code builder agent. You have the following existing code:
${previousCode}

The user wants to update or add features according to:
"${prompt}"

Rules:
1. You can generate or update code in **any programming language or framework** (HTML, CSS, JavaScript, Python, Node.js, Java, C++, C#, PHP, Go, Ruby, Rust, Swift, Kotlin, TypeScript, React, Vue, Angular, etc.).
2. Always wrap code in proper markdown blocks with correct language tags: \`\`\`html\`\`\`, \`\`\`css\`\`\`, \`\`\`javascript\`\`\`, \`\`\`python\`\`\`, \`\`\`java\`\`\`, \`\`\`cpp\`\`\`, \`\`\`csharp\`\`\`, \`\`\`php\`\`\`, \`\`\`go\`\`\`, \`\`\`ruby\`\`\`, \`\`\`rust\`\`\`, \`\`\`swift\`\`\`, etc.
3. Only return code (with inline comments if needed). Do NOT add explanations outside code.
4. Only update or add code that is needed. Do NOT remove unrelated code.
`;
    } else {
      // If no previous code, generate full project
      requestPrompt = `
You are an AI code builder agent.
Generate a FULL working project for this request:
"${prompt}"

Rules:
1. You can generate or update code in **any programming language or framework** (HTML, CSS, JavaScript, Python, Node.js, Java, C++, C#, PHP, Go, Ruby, Rust, Swift, Kotlin, TypeScript, React, Vue, Angular, etc.).
2. Always wrap code in proper markdown blocks with correct language tags: \`\`\`html\`\`\`, \`\`\`css\`\`\`, \`\`\`javascript\`\`\`, \`\`\`python\`\`\`, \`\`\`java\`\`\`, \`\`\`cpp\`\`\`, \`\`\`csharp\`\`\`, \`\`\`php\`\`\`, \`\`\`go\`\`\`, \`\`\`ruby\`\`\`, \`\`\`rust\`\`\`, \`\`\`swift\`\`\`, etc.
3. Only return code (with inline comments if needed). Do NOT add explanations outside code.
4. If generating a web app, HTML must be complete (<html>, <head>, <body>).
`;
    }

    const result = await model.generateContent(requestPrompt);
    const fullOutput = await result.response.text();

    if (!fullOutput || fullOutput.trim() === "") {
      return res.status(500).json({ error: "AI returned empty output" });
    }

    // Update previousCode if exists
    let updatedCode = previousCode || "";
    if (previousCode) {
      // Replace code blocks in previousCode with AI updates
      const regex = /```(\w+)[\s\S]*?```/g;
      let match;
      while ((match = regex.exec(fullOutput)) !== null) {
        const codeBlock = match[0].replace(/```(\w+)/, '').replace(/```/, '').trim();
        updatedCode += "\n\n" + codeBlock; // append or replace only updated blocks
      }
    } else {
      updatedCode = fullOutput;
    }

    res.status(200).json({ output: updatedCode });

  } catch (err) {
    console.error("AI request failed:", err);
    res.status(500).json({ error: "AI request failed" });
  }
}
