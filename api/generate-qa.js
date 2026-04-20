export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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
        system: req.body.messages.find(m => m.role === "system")?.content || "",
        messages: req.body.messages.filter(m => m.role !== "system"),
      }),
    });

    const data = await response.json();

    // Anthropic 응답을 Groq 형식으로 변환해서 반환
    const text = data.content?.[0]?.text || "[]";
    const converted = {
      choices: [
        {
          message: {
            content: text
          }
        }
      ]
    };

    res.status(200).json(converted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
