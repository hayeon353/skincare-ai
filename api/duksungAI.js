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
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "당신은 피부과 상담 전문가이자 화장품 전문가입니다. 사용자의 피부타입과 피부 고민에 따라, 효과적인 스킨케어 제품 유형과 조언을 200자 이내로 쉬운 말로 알려주세요. 부정적인 표현 없이 긍정적이고 따뜻한 말투로 설명해주세요.",
      },
    });

    res.status(200).json({ answer: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API 오류 발생" });
  }
}
