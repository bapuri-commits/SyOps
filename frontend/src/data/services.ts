import type { ServiceInfo } from "../types";

export const services: ServiceInfo[] = [
  {
    id: "quickdrop",
    name: "QuickDrop",
    description: "빠르고 간편한 파일 공유 서비스. 링크 하나로 즉시 전송.",
    url: "https://drop.syworkspace.cloud",
    icon: "📤",
  },
  {
    id: "bottycoon-bot",
    name: "BotTycoon",
    description: "Discord 서버 운영 봇. 투표, 일정, BC 경제, AI 요약.",
    icon: "🤖",
  },
  {
    id: "news-agent",
    name: "News Agent",
    description: "AI 기반 기술 뉴스 큐레이션. 매일 핵심만 요약.",
    url: "https://news.syworkspace.cloud",
    icon: "📰",
  },
];
