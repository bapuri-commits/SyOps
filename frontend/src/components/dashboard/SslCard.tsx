export interface SslData {
  hostname: string;
  status: string;
  days_left?: number;
  not_after?: string;
  detail?: string;
}

function statusStyle(status: string) {
  if (status === "ok") return { dot: "bg-emerald-400", text: "text-emerald-400", label: "정상" };
  if (status === "warning") return { dot: "bg-amber-400", text: "text-amber-400", label: "만료 임박" };
  if (status === "critical") return { dot: "bg-red-400", text: "text-red-400", label: "긴급" };
  return { dot: "bg-slate-400", text: "text-slate-400", label: "확인 불가" };
}

export default function SslCard({ data }: { data: SslData | null }) {
  if (!data) {
    return (
      <div className="rounded-xl border border-border-subtle bg-surface-card p-4 animate-pulse">
        <div className="h-4 w-24 rounded bg-slate-700" />
        <div className="mt-3 h-3 w-40 rounded bg-slate-700" />
      </div>
    );
  }

  const s = statusStyle(data.status);
  const expiry = data.not_after
    ? new Date(data.not_after).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <span className="text-sm font-medium text-slate-300">SSL 인증서</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {data.hostname} &middot; 만료 {expiry}
        {data.days_left != null && ` (${data.days_left}일 남음)`}
      </p>
      {data.detail && <p className="mt-1 text-xs text-red-400">{data.detail}</p>}
    </div>
  );
}
