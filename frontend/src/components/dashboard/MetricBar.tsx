interface Props {
  label: string;
  value: number;
  detail: string;
}

function barColor(pct: number) {
  if (pct >= 90) return "bg-red-400";
  if (pct >= 70) return "bg-amber-400";
  return "bg-emerald-400";
}

export default function MetricBar({ label, value, detail }: Props) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-2xl font-bold text-white">{value}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor(value)}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
