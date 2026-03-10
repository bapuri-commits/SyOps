import type { ServiceStatus } from "../types";

const config: Record<ServiceStatus, { dot: string; label: string; text: string }> = {
  up: { dot: "bg-emerald-400 shadow-[0_0_6px_#34d399]", label: "운영 중", text: "text-emerald-400" },
  down: { dot: "bg-red-400 shadow-[0_0_6px_#f87171]", label: "오프라인", text: "text-red-400" },
  unknown: { dot: "bg-slate-400 animate-pulse", label: "확인 대기", text: "text-slate-400" },
};

export default function StatusBadge({ status }: { status: ServiceStatus }) {
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      <span className={`text-xs font-medium ${c.text}`}>{c.label}</span>
    </span>
  );
}
