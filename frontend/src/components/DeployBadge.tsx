import type { DeployStatus } from "../types";

const config: Record<DeployStatus, { label: string; className: string }> = {
  live: {
    label: "운영 중",
    className: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  },
  coming_soon: {
    label: "준비 중",
    className: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  },
  dev: {
    label: "개발 중",
    className: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  },
};

export default function DeployBadge({ status }: { status: DeployStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${c.className}`}
    >
      {c.label}
    </span>
  );
}
