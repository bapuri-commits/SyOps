import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import BotStatusCard from "../components/bot/BotStatusCard";
import EconomyPanel from "../components/bot/EconomyPanel";
import ActivityPanel from "../components/bot/ActivityPanel";
import TransactionList from "../components/bot/TransactionList";
import GuildConfigPanel from "../components/bot/GuildConfigPanel";

interface BotHealth {
  status: string;
  latency_ms: number | null;
  uptime_seconds: number;
  guilds: { id: string; name: string; member_count: number }[];
  cogs_loaded: number;
}

interface Capabilities {
  api_version: string;
  features: string[];
  cogs_loaded: number;
}

const POLL_MS = 15_000;

export default function BotDashboard() {
  const { authenticated, initializing, authFetch } = useAuth();
  const navigate = useNavigate();

  const [health, setHealth] = useState<BotHealth | null>(null);
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const [guildId, setGuildId] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/bot/health");
      if (res.ok) {
        const data: BotHealth = await res.json();
        setHealth(data);
        if (!guildId && data.guilds.length > 0) {
          setGuildId(data.guilds[0].id);
        }
      }
    } catch { /* ignore */ }
  }, [guildId]);

  const fetchCaps = useCallback(async () => {
    try {
      const res = await authFetch("/api/bot/capabilities");
      if (res.ok) setCaps(await res.json());
    } catch { /* ignore */ }
  }, [authFetch]);

  useEffect(() => {
    if (initializing) return;
    if (!authenticated) {
      navigate("/login", { replace: true });
      return;
    }
    fetchHealth();
    fetchCaps();
    const timer = setInterval(fetchHealth, POLL_MS);
    return () => clearInterval(timer);
  }, [authenticated, initializing, navigate, fetchHealth, fetchCaps]);

  const offline = health?.status === "offline" || !health;

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-500 transition-colors hover:text-slate-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">
            <span className="text-3xl mr-2">🤖</span>
            BotTycoon
            <span className="ml-2 text-sm font-normal text-slate-400">대시보드</span>
          </h1>
        </div>
      </div>

      {/* Status */}
      <section className="mt-6">
        <BotStatusCard health={health} />
      </section>

      {offline || !guildId ? (
        <div className="mt-8 rounded-xl border border-border-subtle bg-surface-card p-8 text-center">
          <p className="text-slate-400">봇이 오프라인이거나 길드에 연결되지 않았습니다.</p>
        </div>
      ) : (
        <>
          {/* Economy */}
          {caps?.features.includes("economy") && (
            <section className="mt-6">
              <EconomyPanel guildId={guildId} authFetch={authFetch} />
            </section>
          )}

          {/* Activity */}
          <section className="mt-6">
            <ActivityPanel guildId={guildId} authFetch={authFetch} caps={caps} />
          </section>

          {/* Transactions */}
          {caps?.features.includes("economy") && (
            <section className="mt-6">
              <TransactionList guildId={guildId} authFetch={authFetch} />
            </section>
          )}

          {/* Config */}
          {caps?.features.includes("economy") && (
            <section className="mt-6 mb-8">
              <GuildConfigPanel guildId={guildId} authFetch={authFetch} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
