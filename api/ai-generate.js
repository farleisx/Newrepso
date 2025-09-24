import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // cheaper + fast, good for coding
      messages: [
        { role: "system", content: "You are an AI website builder agent. Generate HTML, CSS, and JS code based on user descriptions." },
        { role: "user", content: prompt },
      ],
    });

    const output = completion.choices[0].message.content;
    res.status(200).json({ output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
}
