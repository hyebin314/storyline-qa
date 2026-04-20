export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const systemMsg = req.body.messages.find(m => m.role === "system")?.content || "";
    const userMsg = req.body.messages.find(m => m.role === "user")?.content || "";

    console.log("=== USER MSG ===", userMsg);

    const prompt = `${systemMsg}

${userMsg}

위 기획서를 바탕으로 QA 테스트 케이스를 JSON 배열로 생성하세요.
반드시 아래 형식을 따르세요:

[
  {
    "title": "테스트 케이스 제목",
    "account": "테스트 계정",
    "precondition": "사전 조건",
    "testSteps": "1. 단계1\\n2. 단계2",
    "expected": "예상 결과",
    "note": "실제 결과"
  }
]

주의사항:
- 반드시 [ 로 시작하고 ] 로 끝나는 JSON 배열만 출력
- 마크다운, 코드블록, 설명 텍스트 절대 포함 금지
- 최소 10개 이상 생성
- 모든 값은 한국어로 작성`;

    console.log("=== PROMPT ===", prompt.slice(0, 200));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await response.json();
    console.log("=== GEMINI RESPONSE ===", JSON.stringify(data).slice(0, 500));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    console.log("=== EXTRACTED TEXT ===", text.slice(0, 300));

    const cleaned = text.replace(/```json|```/g, "").trim();
    const jsonStr = cleaned.includes("[")
      ? cleaned.slice(cleaned.indexOf("["), cleaned.lastIndexOf("]") + 1)
      : "[]";

    res.status(200).json({
      choices: [{ message: { content: jsonStr } }]
    });
  } catch (error) {
    console.log("=== ERROR ===", error.message);
    res.status(500).json({ error: error.message });
  }
}
