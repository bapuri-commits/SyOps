import { useEffect, useState } from "react";

interface EconomyData {
  total_circulation: number;
  total_users: number;
  transactions_today: number;
  checkins_today: number;
  top_holders: { discord_id: string; name: string; balance: number }[];
  active_boosts: { id: number; target: string; multiplier: number; expires_at: string | null }[];
}

interface Props {
  guildId: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export default function EconomyPanel({ guildId, authFetch }: Props) {
  const [data, setData] = useState<EconomyData | null>(null);

  useEffect(() => {
    authFetch(`/api/bot/economy/overview?guild_id=${guildId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {});
  }, [guildId, authFetch]);

  if (!data) {
    return <div className="h-48 animate-pulse rounded-xl border border-border-subtle bg-surface-card" />;
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5">
      <h2 className="text-sm font-semibold text-slate-300">BC 경제</h2>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="총 유통량" value={`${data.total_circulation.toLocaleString()} BC`} />
        <Stat label="사용자" value={String(data.total_users)} />
        <Stat label="오늘 거래" value={String(data.transactions_today)} />
        <Stat label="오늘 출석" value={String(data.checkins_today)} />
      </div>

      {data.top_holders.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2">Top 홀더</p>
          <div className="space-y-1">
            {data.top_holders.map((h, i) => (
              <div key={h.discord_id} className="flex items-center justify-between rounded-md bg-surface-hover px-3 py-1.5 text-sm">
                <span className="text-slate-400">
                  <span className="text-xs text-slate-600 mr-2">#{i + 1}</span>
                  {h.name}
                </span>
                <span className="font-medium text-accent">{h.balance.toLocaleString()} BC</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.active_boosts.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2">활성 부스트</p>
          <div className="flex flex-wrap gap-2">
            {data.active_boosts.map((b) => (
              <span key={b.id} className="rounded-md bg-amber-400/10 px-2 py-0.5 text-xs text-amber-400">
                {b.target} x{b.multiplier}
              </span>
            ))}
          </div>
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
