interface BotHealth {
  status: string;
  latency_ms: number | null;
  uptime_seconds: number;
  guilds: { id: string; name: string; member_count: number }[];
  cogs_loaded: number;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}일 ${h}시간`;
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

export default function BotStatusCard({ health }: { health: BotHealth | null }) {
  if (!health) {
    return (
      <div className="h-32 animate-pulse rounded-xl border border-border-subtle bg-surface-card" />
    );
  }

  const online = health.status === "online";
  const statusColor = online ? "text-emerald-400" : health.status === "starting" ? "text-amber-400" : "text-red-400";
  const statusDot = online ? "bg-emerald-400" : health.status === "starting" ? "bg-amber-400" : "bg-red-400";
  const statusLabel = online ? "온라인" : health.status === "starting" ? "시작 중" : "오프라인";

  const totalMembers = health.guilds.reduce((sum, g) => sum + g.member_count, 0);

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusDot}`} />
          <span className={`text-sm font-semibold ${statusColor}`}>{statusLabel}</span>
        </div>
        {health.latency_ms != null && (
          <span className="text-xs text-slate-500">{health.latency_ms}ms</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="업타임" value={formatUptime(health.uptime_seconds)} />
        <Stat label="길드" value={String(health.guilds.length)} />
        <Stat label="멤버" value={String(totalMembers)} />
        <Stat label="Cogs" value={String(health.cogs_loaded)} />
      </div>

      {health.guilds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {health.guilds.map((g) => (
            <span key={g.id} className="rounded-md bg-surface-hover px-2 py-0.5 text-xs text-slate-400">
              {g.name} ({g.member_count})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
