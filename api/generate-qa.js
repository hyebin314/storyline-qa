export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const systemMsg = req.body.messages.find(m => m.role === "system")?.content || "";
    const userMsg = req.body.messages.filter(m => m.role !== "system");

    console.log("=== USER MESSAGE ===", JSON.stringify(userMsg));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: systemMsg + "\n\nYou MUST respond with ONLY a valid JSON array. No explanation, no markdown, no code block. Start your response with [ and end with ].",
        messages: userMsg,
      }),
    });

    const data = await response.json();
    console.log("=== CLAUDE RAW RESPONSE ===", JSON.stringify(data));

    const text = data.content?.[0]?.text || "[]";
    console.log("=== EXTRACTED TEXT ===", text);

    const converted = {
      choices: [{ message: { content: text } }]
    };

    res.status(200).json(converted);
  } catch (error) {
    console.log("=== ERROR ===", error.message);
    res.status(500).json({ error: error.message });
  }
}
