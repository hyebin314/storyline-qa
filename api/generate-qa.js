export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const jsonStr = cleaned.includes("[")
      ? cleaned.slice(cleaned.indexOf("["), cleaned.lastIndexOf("]") + 1)
      : "[]";

    const parsed = JSON.parse(jsonStr);

    // 모든 필드값을 문자열로 강제 변환
    const normalized = parsed.map(item => {
      const obj = {};
      for (const key in item) {
        const val = item[key];
        if (Array.isArray(val)) {
          obj[key] = val.join("\n");
        } else if (typeof val === "object" && val !== null) {
          obj[key] = JSON.stringify(val);
        } else {
          obj[key] = String(val ?? "");
        }
      }
      return obj;
    });

    res.status(200).json({
      choices: [{ message: { content: JSON.stringify(normalized) } }]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
