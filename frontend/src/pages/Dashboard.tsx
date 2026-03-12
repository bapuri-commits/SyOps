import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useServiceHealth } from "../hooks/useServiceHealth";
import MetricBar from "../components/dashboard/MetricBar";
import SslCard, { type SslData } from "../components/dashboard/SslCard";
import ServicePanel from "../components/dashboard/ServicePanel";

interface Metrics {
  cpu: { percent: number; cores: number };
  memory: { total_gb: number; used_gb: number; percent: number };
  disk: { total_gb: number; used_gb: number; percent: number };
}

const METRIC_POLL_MS = 10_000;

const MANAGED_SERVICES = [
  { id: "quickdrop", name: "QuickDrop" },
  { id: "nginx", name: "nginx" },
];

export default function Dashboard() {
  const { authenticated, initializing, logout, authFetch } = useAuth();
  const navigate = useNavigate();

  const healthMap = useServiceHealth(MANAGED_SERVICES.map((s) => s.id));
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [ssl, setSsl] = useState<SslData | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await authFetch("/api/metrics");
      if (res.ok) setMetrics(await res.json());
    } catch { /* ignore */ }
  }, [authFetch]);

  useEffect(() => {
    if (initializing) return;
    if (!authenticated) {
      navigate("/login", { replace: true });
      return;
    }
    fetchMetrics();
    const timer = setInterval(fetchMetrics, METRIC_POLL_MS);
    return () => clearInterval(timer);
  }, [authenticated, initializing, navigate, fetchMetrics]);

  useEffect(() => {
    if (initializing || !authenticated) return;
    authFetch("/api/ssl")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setSsl(d))
      .catch(() => {});
  }, [authenticated, initializing, authFetch]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-500 transition-colors hover:text-slate-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">
            Sy<span className="text-accent">Ops</span>
            <span className="ml-2 text-sm font-normal text-slate-400">대시보드</span>
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border border-border-subtle px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-red-400/40 hover:text-red-400"
        >
          로그아웃
        </button>
      </div>

      {/* Metrics */}
      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {metrics ? (
          <>
            <MetricBar
              label="CPU"
              value={Math.round(metrics.cpu.percent)}
              detail={`${metrics.cpu.cores} cores`}
            />
            <MetricBar
              label="메모리"
              value={Math.round(metrics.memory.percent)}
              detail={`${metrics.memory.used_gb} / ${metrics.memory.total_gb} GB`}
            />
            <MetricBar
              label="디스크"
              value={Math.round(metrics.disk.percent)}
              detail={`${metrics.disk.used_gb} / ${metrics.disk.total_gb} GB`}
            />
          </>
        ) : (
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border-subtle bg-surface-card" />
          ))
        )}
      </section>

      {/* SSL */}
      <section className="mt-4">
        <SslCard data={ssl} />
      </section>

      {/* Services */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">서비스 관리</h2>
        <div className="space-y-3">
          {MANAGED_SERVICES.map((svc) => (
            <ServicePanel
              key={svc.id}
              id={svc.id}
              name={svc.name}
              status={healthMap[svc.id]?.status ?? "unknown"}
            />
          ))}
        </div>
      </section>

      {/* Disk warning */}
      {metrics && metrics.disk.percent >= 80 && (
        <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm font-medium text-amber-400">
            디스크 사용량 경고 — {metrics.disk.percent}% 사용 중
          </p>
          <p className="mt-1 text-xs text-amber-400/70">
            {metrics.disk.used_gb} / {metrics.disk.total_gb} GB 사용. 정리가 필요할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
