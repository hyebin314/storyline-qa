export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const systemMsg = req.body.messages.find(m => m.role === "system")?.content || "";
    const userMsg = req.body.messages.find(m => m.role === "user")?.content || "";
    const prompt = systemMsg + "\n\n" + userMsg + "\n\nJSON 배열만 반환하세요. [ 로 시작하고 ] 로 끝내세요.";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const jsonStr = text.includes("[") ? text.slice(text.indexOf("["), text.lastIndexOf("]") + 1) : "[]";

    res.status(200).json({
      choices: [{ message: { content: jsonStr } }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
