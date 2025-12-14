import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MatchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Flash for speed as we want instant matching
const MODEL_NAME = "gemini-2.5-flash";

export const analyzeWishAndMatch = async (wish: string): Promise<MatchResult> => {
  const prompt = `
    사용자는 크리스마스를 혼자 보내는 사람이고, 구체적인 소원이 있습니다.
    사용자의 소원: "${wish}".
    
    1. 이 소원의 "분위기"와 활동을 분석하세요.
    2. 비슷한 소원을 가진 사람들을 위한 재미있고 눈에 띄는 크리스마스 테마의 채팅방 이름을 한국어로 만드세요 (예: "방구석 케빈들의 모임", "새벽 스키 파티", "솔로 게이머 길드").
    3. 이 그룹이 무엇을 하는지 한국어로 짧게 설명하세요.
    4. 2-3개의 짧은 태그를 한국어로 생성하세요 (예: #힐링, #파티, #게임).
    5. "initialMembers"는 3에서 7 사이의 랜덤한 숫자로 설정하세요 (이들은 대기방에 있는 가상의 기존 유저들입니다).
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      groupName: { type: Type.STRING },
      theme: { type: Type.STRING },
      description: { type: Type.STRING },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      initialMembers: { type: Type.INTEGER },
    },
    required: ["groupName", "theme", "description", "tags", "initialMembers"],
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "당신은 따뜻하고 도움이 되는 크리스마스 매칭 AI입니다. 모든 응답은 한국어로 해야 합니다.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as MatchResult;
  } catch (error) {
    console.error("Matching failed", error);
    // Fallback if AI fails
    return {
      groupName: "크리스마스 대피소",
      theme: "General",
      description: "누구나 편하게 쉴 수 있는 공간입니다.",
      tags: ["#휴식", "#크리스마스"],
      initialMembers: 4,
    };
  }
};

export const generateBotMessage = async (
  groupTheme: string,
  chatHistory: { name: string; text: string }[]
): Promise<string> => {
  const historyText = chatHistory.slice(-5).map(m => `${m.name}: ${m.text}`).join("\n");
  
  const prompt = `
    당신은 솔로들을 위한 크리스마스 단체 채팅방의 사용자입니다.
    그룹 테마: "${groupTheme}".
    
    최근 대화:
    ${historyText}
    
    랜덤한 멤버(AI 아님, 실제 사람처럼)의 관점에서 짧고, 캐주얼하고, 친근한 한 문장짜리 채팅 메시지를 한국어로 생성하세요. 
    마지막 사람의 말에 동의하거나, 질문하거나, 현재 상황(예: "방금 치킨 시켰음", "나홀로집에 보는 중인데 웃기네")을 공유하세요.
    해시태그는 쓰지 마세요. 자연스러운 인터넷 말투(반말, 존댓말 섞어서 상황에 맞게)를 사용하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        maxOutputTokens: 50,
        temperature: 1.2, // Higher temperature for variety
      },
    });
    return response.text?.trim() || "다들 메리 크리스마스!";
  } catch (error) {
    return "다들 뭐하고 계신가요?";
  }
};