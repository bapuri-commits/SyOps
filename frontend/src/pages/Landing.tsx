import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { services } from "../data/services";
import { projects } from "../data/projects";

const liveCount = services.filter((s) => s.deployStatus === "live").length;
const totalProjects = projects.length;

const CTA_ITEMS = [
  {
    to: "/services",
    icon: "⚡",
    title: "서비스",
    sub: `${liveCount}개 운영 중`,
  },
  {
    to: "/projects",
    icon: "💼",
    title: "프로젝트",
    sub: `${totalProjects}개 포트폴리오`,
  },
  {
    to: "/blog",
    icon: "✍️",
    title: "블로그",
    sub: "일상 · 에세이",
  },
  {
    to: "/log",
    icon: "📋",
    title: "개발로그",
    sub: "빌드 과정 기록",
  },
  {
    to: "/algorithm",
    icon: "🧩",
    title: "알고리즘",
    sub: "문제 풀이",
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-12 px-4 py-16">
      {/* Hero */}
      <header className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-4 py-1.5 text-xs font-medium text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          syworkspace.cloud
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Sy<span className="text-accent">Ops</span>
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-400">
          풀스택 개인 서비스 플랫폼.
          <br className="hidden sm:block" />
          서비스 운영부터 포트폴리오까지, 한 곳에서.
        </p>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-500">
          <span>{liveCount}개 서비스 운영</span>
          <span className="text-border-subtle">·</span>
          <span>{totalProjects}개 프로젝트</span>
        </div>
      </header>

      {/* CTA Grid */}
      <section className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {CTA_ITEMS.map(({ to, icon, title, sub }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 transition-all duration-200 hover:border-accent/40 hover:bg-surface-hover hover:shadow-lg hover:shadow-accent/5 sm:flex-col sm:items-start sm:gap-0"
          >
            <span className="text-2xl sm:text-3xl">{icon}</span>
            <div className="sm:mt-3">
              <span className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                {title}
              </span>
              <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3">
        <Footer />
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-accent"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          관리
        </Link>
      </div>
    </div>
  );
}
