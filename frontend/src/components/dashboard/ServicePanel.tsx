import { useState } from "react";
import type { ServiceStatus } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  id: string;
  name: string;
  status: ServiceStatus;
}

export default function ServicePanel({ id, name, status }: Props) {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState<string | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [restartMsg, setRestartMsg] = useState<string | null>(null);

  async function toggleLogs() {
    if (logsOpen) {
      setLogsOpen(false);
      return;
    }
    setLogsOpen(true);
    setLogsLoading(true);
    setLogs(null);
    try {
      const res = await authFetch(`/api/services/${id}/logs?lines=30`);
      const data = await res.json();
      setLogs(data.logs ?? "로그를 불러올 수 없습니다.");
    } catch {
      setLogs("로그 요청 실패");
    }
    setLogsLoading(false);
  }

  async function handleRestart() {
    if (!confirm(`${name} 서비스를 재시작하시겠습니까?`)) return;
    setRestarting(true);
    setRestartMsg(null);
    try {
      const res = await authFetch(`/api/services/${id}/restart`, { method: "POST" });
      const data = await res.json();
      setRestartMsg(data.success ? "재시작 완료" : data.detail);
    } catch {
      setRestartMsg("요청 실패");
    }
    setRestarting(false);
  }

  const dotColor =
    status === "up" ? "bg-emerald-400" :
    status === "down" ? "bg-red-400" : "bg-slate-400";

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <span className="text-sm font-semibold text-white">{name}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleLogs}
            className="rounded-md border border-border-subtle px-2.5 py-1 text-xs text-slate-400 transition-colors hover:border-accent/40 hover:text-accent"
          >
            {logsOpen ? "닫기" : "로그"}
          </button>
          <button
            onClick={handleRestart}
            disabled={restarting}
            className="rounded-md border border-border-subtle px-2.5 py-1 text-xs text-slate-400 transition-colors hover:border-amber-400/40 hover:text-amber-400 disabled:opacity-40"
          >
            {restarting ? "..." : "재시작"}
          </button>
        </div>
      </div>

      {restartMsg && (
        <p className="mt-2 text-xs text-amber-400">{restartMsg}</p>
      )}

      {logsOpen && (
        <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-surface p-3 text-[11px] leading-relaxed text-slate-400 scrollbar-thin">
          {logsLoading ? "불러오는 중..." : (logs ?? "데이터 없음")}
        </pre>
      )}
    </div>
  );
}
