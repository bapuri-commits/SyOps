import { useEffect, useState } from "react";

interface Transaction {
  id: number;
  discord_id: string;
  name: string;
  amount: number;
  balance_after: number;
  tx_type: string;
  reason: string;
  created_at: string | null;
}

interface Props {
  guildId: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const TX_LABELS: Record<string, string> = {
  earn: "적립", spend: "사용", gamble_win: "게임 승리", gamble_lose: "게임 패배",
  transfer_in: "수신", transfer_out: "송신", admin_give: "관리자 지급",
  admin_take: "관리자 차감", shop_redeem: "상점 교환", shop_refund: "상점 환불",
};

export default function TransactionList({ guildId, authFetch }: Props) {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    authFetch(`/api/bot/economy/transactions?guild_id=${guildId}&limit=20`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setTxs(d.transactions))
      .catch(() => {});
  }, [guildId, authFetch]);

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-300 hover:text-white transition-colors"
      >
        최근 거래
        <svg className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
          {txs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">거래 내역이 없습니다.</p>
          ) : (
            txs.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-md bg-surface-hover px-3 py-2 text-xs">
                <div>
                  <span className="text-slate-400">{tx.name}</span>
                  <span className="ml-2 text-slate-600">{TX_LABELS[tx.tx_type] ?? tx.tx_type}</span>
                  {tx.reason && <span className="ml-1 text-slate-600">— {tx.reason}</span>}
                </div>
                <div className="text-right">
                  <span className={tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {tx.amount >= 0 ? "+" : ""}{tx.amount}
                  </span>
                  <span className="ml-2 text-slate-600">{tx.balance_after} BC</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
