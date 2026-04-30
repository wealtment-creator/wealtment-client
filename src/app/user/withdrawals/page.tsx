"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashLayout } from "@/components/layout/DashLayout";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { getUser } from "@/lib/auth";
import { apiGetMyWithdrawals } from "@/lib/api";
import { COIN_PRICES } from "@/lib/data";
import { formatUSD } from "@/lib/utils";
import {
  ArrowUpFromLine, Clock, CheckCircle, XCircle,
  Loader, Plus, RefreshCw,
} from "lucide-react";

// ─── Matches the real API response for /withdrawals/my ───────────────────────
// user is a plain string (user ID) — not populated on the /my endpoint
interface MyWithdrawal {
  _id: string;
  user: string;
  coinType: "bitcoin" | "litecoin";
  walletAddress: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

function coinLabel(ct: string) { return ct === "bitcoin" ? "BTC" : "LTC"; }
function coinIcon(ct: string)  { return ct === "bitcoin" ? "₿" : "Ł"; }
function coinColor(ct: string) { return ct === "bitcoin" ? "#F7931A" : "#345D9D"; }
function usdValue(amount: number) {
  return amount
  //  * (ct === "bitcoin" ? COIN_PRICES.BTC : COIN_PRICES.LTC);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusPill({ status }: { status: MyWithdrawal["status"] }) {
  const map = {
    pending:  { icon: <Clock size={11} />,        label: "Pending",  cls: "text-[var(--gold)]  border-[rgba(212,168,67,0.3)]  bg-[rgba(212,168,67,0.08)]" },
    approved: { icon: <CheckCircle size={11} />,   label: "Approved", cls: "text-[var(--green)] border-[rgba(52,211,153,0.3)]  bg-[rgba(52,211,153,0.08)]" },
    rejected: { icon: <XCircle size={11} />,       label: "Rejected", cls: "text-[var(--red)]   border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)]" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

const UserWithdrawalsPage = () => {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<MyWithdrawal[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState<"all" | "pending" | "approved" | "rejected">("all");

  const load = async () => {
    setLoading(true);
    try {
      // GET /withdrawals/my
      const res = await apiGetMyWithdrawals();
      // handle plain array or wrapped object
      console.log('withdrawals', res)
      setWithdrawals(Array.isArray(res) ? res : res.withdrawals ?? res.data ?? []);
    } catch { /* silent — show empty */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    load();
  }, [router]);

  const filtered = filter === "all"
    ? withdrawals
    : withdrawals.filter((w) => w.status === filter);

  const counts = {
    all:      withdrawals.length,
    pending:  withdrawals.filter((w) => w.status === "pending").length,
    approved: withdrawals.filter((w) => w.status === "approved").length,
    rejected: withdrawals.filter((w) => w.status === "rejected").length,
  };

  return (
    <DashLayout variant="user">
      <CryptoTicker />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <ArrowUpFromLine className="text-[var(--teal)]" size={24} />
              My Withdrawals
            </h1>
            <p className="text-[var(--muted)] text-sm mt-0.5">All your withdrawal requests and their status.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-2)] text-[var(--muted)] text-xs font-bold hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors disabled:opacity-50">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <Link href="/user/withdraw"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black text-xs font-bold hover:opacity-90 transition-opacity">
              <Plus size={13} /> New Withdrawal
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => {
            const clr: Record<string, string> = {
              all: "text-[var(--text)]", pending: "text-[var(--gold)]",
              approved: "text-[var(--green)]", rejected: "text-[var(--red)]",
            };
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  filter === s
                    ? "border-[var(--gold)] bg-[var(--gold-glow)] text-[var(--gold)]"
                    : "glass text-[var(--muted)] hover:border-[var(--border-2)]"
                }`}>
                <span className={clr[s]}>{counts[s as keyof typeof counts]}</span>
                <span className="ml-1.5 capitalize">{s}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader size={28} className="text-[var(--gold)] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl py-20 text-center">
            <ArrowUpFromLine size={36} className="text-[var(--muted)] mx-auto mb-4 opacity-30" />
            <p className="text-[var(--muted)] font-semibold">
              {filter === "all" ? "No withdrawals yet." : `No ${filter} withdrawals.`}
            </p>
            {filter === "all" && (
              <Link href="/user/withdraw"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black text-sm font-bold hover:opacity-90 transition-opacity">
                <Plus size={14} /> Request a Withdrawal
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ── Mobile: stacked cards ── */}
            <div className="md:hidden space-y-3">
              {filtered.map((w) => {
                const usd = usdValue(w.amount);
                return (
                  <div key={w._id} className="glass rounded-2xl p-4 space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                          style={{ background: `${coinColor(w.coinType)}20`, color: coinColor(w.coinType) }}>
                          {coinIcon(w.coinType)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            {w.amount} <span style={{ color: coinColor(w.coinType) }}>{coinLabel(w.coinType)}</span>
                          </p>
                          <p className="text-xs text-[var(--muted)]">≈ {formatUSD(usd)}</p>
                        </div>
                      </div>
                      <StatusPill status={w.status} />
                    </div>

                    {/* Wallet address */}
                    <div className="rounded-lg bg-[var(--bg-3)] border border-[var(--border)] px-3 py-2">
                      <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest mb-0.5">Wallet</p>
                      <p className="font-mono text-xs text-[var(--teal)] truncate">{w.walletAddress}</p>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-[var(--muted)]">{fmtDate(w.createdAt)}</p>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop: table ── */}
            <div className="hidden md:block rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
                      {["Coin", , "USD Value", "Wallet Address", "Date", "Status"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((w) => {
                      const usd = usdValue(w.amount);
                      return (
                        <tr key={w._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
                          {/* Coin */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold" style={{ color: coinColor(w.coinType) }}>
                                {coinIcon(w.coinType)}
                              </span>
                              <span className="text-xs text-[var(--muted)]">{coinLabel(w.coinType)}</span>
                            </div>
                          </td>
                          {/* Amount */}
                          {/* <td className="px-5 py-4 font-mono font-bold">
                            {w.amount}{" "}
                             <span className="text-xs font-normal" style={{ color: coinColor(w.coinType) }}>
                              {coinLabel(w.coinType)}
                            </span> 
                          </td> */}
                          {/* USD Value */}
                          <td className="px-5 py-4 font-mono text-[var(--green)]">{formatUSD(usd)}</td>
                          {/* Wallet */}
                          <td className="px-5 py-4">
                            <span className="font-mono text-[11px] text-[var(--teal)] max-w-[180px] truncate block">
                              {w.walletAddress}
                            </span>
                          </td>
                          {/* Date */}
                          <td className="px-5 py-4 text-xs text-[var(--muted)] whitespace-nowrap">
                            {fmtDate(w.createdAt)}
                          </td>
                          {/* Status */}
                          <td className="px-5 py-4">
                            <StatusPill status={w.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Summary footer */}
        {!loading && withdrawals.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Requests", val: String(counts.all),     accent: "var(--text)" },
              { label: "Approved",        val: String(counts.approved), accent: "var(--green)" },
              { label: "Pending",         val: String(counts.pending),  accent: "var(--gold)" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <p className="font-display text-2xl font-bold" style={{ color: s.accent }}>{s.val}</p>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashLayout>
  );
}

export default UserWithdrawalsPage;