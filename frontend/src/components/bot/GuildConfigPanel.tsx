import { useEffect, useState } from "react";

interface PointConfig {
  voice_base_bc: number;
  voice_interval_sec: number;
  checkin_bc: number;
  daily_cap: number;
  bet_min: number;
  bet_max: number;
  betting_enabled: boolean;
  admin_bonus_multiplier: number;
  [key: string]: number | boolean;
}

interface ConfigData {
  point_config: PointConfig;
  guild_config: {
    public_log_channel_id: string | null;
    admin_log_channel_id: string | null;
    settings: Record<string, unknown> | null;
  };
}

interface Props {
  guildId: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const FIELD_LABELS: Record<string, string> = {
  voice_base_bc: "음성 활동 BC",
  voice_interval_sec: "음성 체크 주기(초)",
  checkin_bc: "출석 BC",
  daily_cap: "일일 상한 (0=무제한)",
  bet_min: "최소 배팅",
  bet_max: "최대 배팅",
  betting_enabled: "배팅 활성화",
  admin_bonus_multiplier: "관리자 게임 배율",
};

const EDITABLE_FIELDS = Object.keys(FIELD_LABELS);

export default function GuildConfigPanel({ guildId, authFetch }: Props) {
  const [data, setData] = useState<ConfigData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState<Record<string, number | boolean>>({});

  useEffect(() => {
    authFetch(`/api/bot/config/${guildId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setData(d);
          setDirty({});
        }
      })
      .catch(() => {});
  }, [guildId, authFetch]);

  async function handleSave() {
    if (Object.keys(dirty).length === 0) return;
    setSaving(true);
    try {
      const res = await authFetch(`/api/bot/config/${guildId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dirty),
      });
      if (res.ok) {
        const result = await res.json();
        if (data) {
          setData({
            ...data,
            point_config: { ...data.point_config, ...result.updated },
          });
        }
        setDirty({});
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  function handleChange(field: string, value: number | boolean) {
    setDirty((prev) => ({ ...prev, [field]: value }));
  }

  if (!data) return null;

  const pc = data.point_config;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-300 hover:text-white transition-colors"
      >
        길드 설정
        <svg className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {EDITABLE_FIELDS.map((field) => {
            const current = dirty[field] ?? pc[field];
            const isBool = typeof pc[field] === "boolean";

            return (
              <div key={field} className="flex items-center justify-between">
                <label className="text-xs text-slate-400">{FIELD_LABELS[field]}</label>
                {isBool ? (
                  <button
                    onClick={() => handleChange(field, !current)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      current ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
                    }`}
                  >
                    {current ? "ON" : "OFF"}
                  </button>
                ) : (
                  <input
                    type="number"
                    value={current as number}
                    onChange={(e) => handleChange(field, Number(e.target.value))}
                    className="w-24 rounded-md border border-border-subtle bg-surface-hover px-2 py-1 text-right text-xs text-white focus:border-accent focus:outline-none"
                  />
                )}
              </div>
            );
          })}

          {Object.keys(dirty).length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-2 w-full rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "변경사항 저장"}
            </button>
          )}

          {data.guild_config.public_log_channel_id && (
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <p className="text-xs text-slate-500">
                공개 로그 채널: <span className="text-slate-400">{data.guild_config.public_log_channel_id}</span>
              </p>
              {data.guild_config.admin_log_channel_id && (
                <p className="text-xs text-slate-500 mt-1">
                  관리자 로그 채널: <span className="text-slate-400">{data.guild_config.admin_log_channel_id}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
