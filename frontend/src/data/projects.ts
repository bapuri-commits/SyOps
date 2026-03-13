export interface ProjectInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  techStack: string[];
  status: "운영 중" | "개발 중" | "설계 완료" | "초기";
  githubUrl?: string;
  liveUrl?: string;
  category: "service" | "tool" | "study";
}

export const projects: ProjectInfo[] = [
  {
    id: "syops",
    name: "SyOps",
    tagline: "풀스택 개인 서비스 플랫폼",
    description:
      "VPS 위에서 운영하는 통합 포털. React + FastAPI 기반. 서비스 모니터링, CI/CD, 와일드카드 SSL, Docker 인프라 관리를 포함.",
    techStack: ["React", "FastAPI", "Tailwind", "Docker", "nginx", "GitHub Actions"],
    status: "운영 중",
    githubUrl: "https://github.com/bapuri-commits/SyOps",
    liveUrl: "https://syworkspace.cloud",
    category: "service",
  },
  {
    id: "quickdrop",
    name: "QuickDrop",
    tagline: "빠르고 간편한 파일 공유",
    description:
      "링크 하나로 파일을 즉시 공유. 텍스트/이미지 클립보드, 만료 설정, Docker 배포. 보안 강화(경로 탐색 차단, XSS 방지, Rate Limiting).",
    techStack: ["FastAPI", "Vanilla JS", "Docker", "nginx"],
    status: "운영 중",
    githubUrl: "https://github.com/bapuri-commits/Quick_Drop",
    liveUrl: "https://drop.syworkspace.cloud",
    category: "service",
  },
  {
    id: "news-agent",
    name: "News Agent",
    tagline: "AI 기반 기술 뉴스 큐레이션",
    description:
      "Claude API + Playwright로 매일 기술 뉴스를 수집·요약·랭킹. 정적 HTML로 생성하여 nginx 서빙. cron 자동화.",
    techStack: ["Python", "Claude API", "Playwright", "HTML/CSS"],
    status: "운영 중",
    githubUrl: "https://github.com/bapuri-commits/News_Agent",
    liveUrl: "https://news.syworkspace.cloud",
    category: "service",
  },
  {
    id: "bottycoon-bot",
    name: "BotTycoon Discord Bot",
    tagline: "Discord 서버 운영 봇",
    description:
      "투표, 일정 관리, BC 경제 시스템, AI 요약 등 서버 운영 자동화. SyOps 대시보드로 원격 모니터링. Docker 배포 + CI/CD.",
    techStack: ["Python", "discord.py", "SQLite", "SQLAlchemy", "Docker"],
    status: "개발 중",
    githubUrl: "https://github.com/bapuri-commits/BotTycoon-discord-bot",
    category: "service",
  },
  {
    id: "lesson-assist",
    name: "Lesson Assist",
    tagline: "수업 녹음 → 전사 → 학습 노트",
    description:
      "다글로 전사본 + school_sync 수업자료를 NotebookLM 패키지로 변환. v2 아키텍처 (pack/note/legacy CLI).",
    techStack: ["Python", "faster-whisper", "OpenAI API", "SRT Parser"],
    status: "개발 중",
    githubUrl: "https://github.com/bapuri-commits/lesson-assist",
    category: "tool",
  },
  {
    id: "school-sync",
    name: "School Sync",
    tagline: "LMS 크롤링 + LLM Q&A",
    description:
      "대학 e-class에서 수업자료·공지·과제를 자동 수집. Gemini/Anthropic 기반 질의응답. Playwright 브라우저 자동화.",
    techStack: ["Python", "Playwright", "Anthropic", "Gemini"],
    status: "개발 중",
    githubUrl: "https://github.com/bapuri-commits/school-sync",
    category: "tool",
  },
  {
    id: "voca-drill",
    name: "Voca Drill",
    tagline: "SM-2 간격 반복 영단어 학습",
    description:
      "토플/토익 대비 영단어 학습 프로그램. SM-2 알고리즘 기반 간격 반복. CLI → 웹 서비스 확장 예정.",
    techStack: ["Python", "Typer", "SQLAlchemy", "SQLite"],
    status: "초기",
    githubUrl: "https://github.com/bapuri-commits/Voca_Drill",
    category: "tool",
  },
  {
    id: "aram-bot",
    name: "아수라장",
    tagline: "LoL 칼바람 메타 분석 + AI 챗봇",
    description:
      "칼바람 나락 빌드·룬·전략 추천. LLM 기반 챗 인터페이스. Phase 0 설계 완료.",
    techStack: ["Python", "FastAPI", "React", "LLM API"],
    status: "초기",
    githubUrl: "https://github.com/bapuri-commits/aram_mayhem_bot",
    category: "service",
  },
  {
    id: "privatellm",
    name: "PrivateLLM",
    tagline: "검열 없는 AI 챗봇",
    description:
      "Abliterated 모델 + RunPod 외부 GPU 기반 프라이빗 챗봇. 로컬/클라우드 하이브리드 아키텍처.",
    techStack: ["Ollama", "RunPod", "Python"],
    status: "초기",
    githubUrl: "https://github.com/bapuri-commits/PrivateLLM",
    category: "service",
  },
  {
    id: "the-agent",
    name: "The Agent",
    tagline: "AI 개인 비서",
    description:
      "RAG 기반 질의응답 + 일정 관리. FastAPI + React + WebSocket 실시간 대화.",
    techStack: ["FastAPI", "React", "WebSocket", "PostgreSQL", "RAG"],
    status: "설계 완료",
    githubUrl: "https://github.com/bapuri-commits/The_Agent",
    category: "service",
  },
  {
    id: "gitmini",
    name: "GitMini",
    tagline: "Git 내부 구조 학습용 CLI",
    description:
      "Git의 핵심 개념(blob, tree, commit)을 직접 구현하며 학습하는 프로젝트. v1.2.0.",
    techStack: ["TypeScript", "Node.js", "zlib"],
    status: "운영 중",
    githubUrl: "https://github.com/bapuri-commits/GitMini",
    category: "study",
  },
  {
    id: "xrun",
    name: "xrun",
    tagline: "C++ CLI 빌드 도구 학습",
    description:
      "CMake 기반 C++ 프로젝트 빌드·실행 자동화 CLI. C++ 학습 과정에서 제작.",
    techStack: ["C++", "CMake"],
    status: "운영 중",
    githubUrl: "https://github.com/bapuri-commits/xrun",
    category: "study",
  },
];
