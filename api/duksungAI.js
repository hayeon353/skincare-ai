import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { name, skinType, concern } = req.body;

  if (!name || !skinType) {
    return res.status(400).json({ error: "이름(name)과 피부타입(skinType)은 필수입니다." });
  }

  const prompt = `
이름: ${name}
피부타입: ${skinType}
피부 고민: ${concern || "없음"}

이 사람에게 맞는 스킨케어 제품을 추천해줘.
- 피부타입에 맞는 화장품 종류
- 추천 성분
- 피해야 할 성분
- 간단한 사용 팁
`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = result.response.candidates[0]?.content?.parts[0]?.text || "추천 결과를 생성할 수 없습니다.";
    res.status(200).json({ answer: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API 오류 발생" });
  }
}