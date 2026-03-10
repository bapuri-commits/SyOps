export default function Header() {
  return (
    <header className="text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-4 py-1.5 text-xs font-medium text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        syworkspace.cloud
      </div>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Sy<span className="text-accent">Ops</span>
      </h1>

      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-400">
        개인 프로젝트 통합 포털.
        <br className="hidden sm:block" />
        서비스 현황을 한눈에 확인하세요.
      </p>
    </header>
  );
}
