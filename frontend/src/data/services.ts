import type { ServiceInfo } from "../types";

export const services: ServiceInfo[] = [
  // --- 유틸리티 ---
  {
    id: "quickdrop",
    name: "QuickDrop",
    description: "빠르고 간편한 파일 공유 서비스. 링크 하나로 즉시 전송.",
    url: "https://drop.syworkspace.cloud",
    icon: "📤",
    category: "utility",
    deployStatus: "live",
  },
  {
    id: "news-agent",
    name: "News Agent",
    description: "AI 기반 기술 뉴스 큐레이션. 매일 핵심만 요약.",
    url: "https://news.syworkspace.cloud",
    icon: "📰",
    category: "utility",
    deployStatus: "live",
  },

  // --- 생산성 ---
  {
    id: "study",
    name: "StudyHub",
    description: "LMS 크롤링 + AI Q&A + 수업 패키징. school_sync + lesson-assist 통합.",
    url: "https://study.syworkspace.cloud",
    icon: "🎓",
    category: "productivity",
    deployStatus: "coming_soon",
  },
  {
    id: "voca-drill",
    name: "Voca Drill",
    description: "SM-2 간격 반복 기반 영단어 학습. 토플/토익 대비.",
    url: "https://voca.syworkspace.cloud",
    icon: "📚",
    category: "productivity",
    deployStatus: "dev",
  },

  // --- AI / 챗 ---
  {
    id: "the-agent",
    name: "The Agent",
    description: "AI 개인 비서. RAG 기반 질의응답 + 일정 관리.",
    url: "https://agent.syworkspace.cloud",
    icon: "🤝",
    category: "ai",
    deployStatus: "dev",
  },
  {
    id: "privatellm",
    name: "PrivateLLM",
    description: "검열 없는 AI 챗봇. Abliterated 모델 + 외부 GPU.",
    url: "https://chat.syworkspace.cloud",
    icon: "💬",
    category: "ai",
    deployStatus: "dev",
  },
  {
    id: "aram-bot",
    name: "아수라장",
    description: "LoL 칼바람 메타 분석 + AI 챗봇. 빌드·룬·전략 추천.",
    url: "https://aram.syworkspace.cloud",
    icon: "⚔️",
    category: "ai",
    deployStatus: "dev",
  },

  // --- Discord ---
  {
    id: "bottycoon-bot",
    name: "BotTycoon",
    description: "Discord 서버 운영 봇. 투표, 일정, BC 경제, AI 요약.",
    icon: "🤖",
    category: "discord",
    deployStatus: "live",
  },
];
