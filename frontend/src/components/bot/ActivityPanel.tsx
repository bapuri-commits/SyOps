import { useEffect, useState } from "react";

interface ActivityData {
  active_votes: number;
  votes: { id: number; title: string; created_at: string | null }[];
  upcoming_schedules: number;
  schedules: { id: number; title: string; event_at: string | null }[];
  games_today: { total: number; by_type: Record<string, number> };
  checkins_today: number;
}

interface Capabilities {
  features: string[];
}

interface Props {
  guildId: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  caps: Capabilities | null;
}

export default function ActivityPanel({ guildId, authFetch, caps }: Props) {
  const [data, setData] = useState<ActivityData | null>(null);

  useEffect(() => {
    authFetch(`/api/bot/activity/summary?guild_id=${guildId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {});
  }, [guildId, authFetch]);

  if (!data) {
    return <div className="h-36 animate-pulse rounded-xl border border-border-subtle bg-surface-card" />;
  }

  const gameTypes: Record<string, string> = {
    coin: "동전", rps: "가위바위보", dice: "주사위",
    slots: "슬롯", guess: "숫자맞추기", quiz: "퀴즈",
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5">
      <h2 className="text-sm font-semibold text-slate-300">활동</h2>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {caps?.features.includes("votes") && (
          <Stat label="진행 중 투표" value={String(data.active_votes)} />
        )}
        {caps?.features.includes("schedules") && (
          <Stat label="예정 일정" value={String(data.upcoming_schedules)} />
        )}
        {caps?.features.includes("games") && (
          <Stat label="오늘 게임" value={String(data.games_today.total)} />
        )}
        {caps?.features.includes("checkin") && (
          <Stat label="오늘 출석" value={String(data.checkins_today)} />
        )}
      </div>

      {data.games_today.total > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(data.games_today.by_type).map(([type, count]) => (
            <span key={type} className="rounded-md bg-surface-hover px-2 py-0.5 text-xs text-slate-400">
              {gameTypes[type] ?? type} {count}회
            </span>
          ))}
        </div>
      )}

      {data.votes.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-1">진행 중 투표</p>
          {data.votes.map((v) => (
            <p key={v.id} className="text-xs text-slate-400">· {v.title}</p>
          ))}
        </div>
      )}

      {data.schedules.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-1">예정 일정</p>
          {data.schedules.map((s) => (
            <p key={s.id} className="text-xs text-slate-400">
              · {s.title}
              {s.event_at && <span className="ml-1 text-slate-600">({new Date(s.event_at).toLocaleDateString("ko")})</span>}
            </p>
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
