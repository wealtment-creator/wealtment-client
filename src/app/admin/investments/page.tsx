"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { getUser } from "@/lib/auth";
import { apiGetAllInvestments } from "@/lib/api";
import { formatUSD } from "@/lib/utils";
import { Search, Filter, Loader, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";

// ── Real API shape ────────────────────────────────────────────────────────────
interface InvestmentRow {
  _id: string;
  user: { _id: string; name: string; email: string };
  package: {
    _id: string;
    name: string;
    profitPercentage: number;
    minimumDeposit: number;
    maximumDeposit: number;
    duration: number;
  };
  amount: number;
  profitPercentage: number;
  totalProfit: number;
  currentProfit: number;
  progress: number;
  status: "active" | "completed" | "cancelled" | "pending";
  isCredited: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

type FilterStatus = "all" | "active" | "completed" | "pending" | "cancelled";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: InvestmentRow["status"] }) {
  const map = {
    active:    "text-[var(--green)]  border-[rgba(52,211,153,0.3)]  bg-[rgba(52,211,153,0.08)]",
    completed: "text-[var(--teal)]   border-[rgba(45,212,191,0.3)]  bg-[rgba(45,212,191,0.08)]",
    pending:   "text-[var(--gold)]   border-[rgba(240,198,66,0.3)]  bg-[rgba(240,198,66,0.08)]",
    cancelled: "text-[var(--red)]    border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)]",
  };
  const icons = { active: <Clock size={10}/>, completed: <CheckCircle size={10}/>, pending: <Clock size={10}/>, cancelled: <XCircle size={10}/> };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${map[status]}`}>
      {icons[status]} {status}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full bg-[var(--bg-3)] rounded-full h-1.5 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AdminInvestmentsPage() {
  const router = useRouter();
  const [investments, setInvestments] = useState<InvestmentRow[]>([]);
  const [filter,      setFilter]      = useState<FilterStatus>("all");
  const [search,      setSearch]      = useState("");
  const [loading,     setLoading]     = useState(true);

  const fetchData = useCallback(async () => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    if (!u.isAdmin) { router.replace("/user/dashboard"); return; }
    try {
      const res = await apiGetAllInvestments();
      // handle plain array or wrapped
      setInvestments(Array.isArray(res) ? res : res.investments ?? res.data ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = investments.filter((inv) => {
    const matchStatus = filter === "all" || inv.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      inv.user?.name?.toLowerCase().includes(q) ||
      inv.user?.email?.toLowerCase().includes(q) ||
      inv.package?.name?.toLowerCase().includes(q) ||
      inv._id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts: Record<FilterStatus, number> = {
    all:       investments.length,
    active:    investments.filter((i) => i.status === "active").length,
    completed: investments.filter((i) => i.status === "completed").length,
    pending:   investments.filter((i) => i.status === "pending").length,
    cancelled: investments.filter((i) => i.status === "cancelled").length,
  };

  const totalInvested     = investments.reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalProfit       = investments.reduce((s, i) => s + (i.totalProfit ?? 0), 0);
  const totalCurrentProfit= investments.reduce((s, i) => s + (i.currentProfit ?? 0), 0);

  const fmtDate2 = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <DashLayout variant="admin">
      <CryptoTicker />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-[var(--gold)]" size={26} /> All Investments
          </h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">
            {loading ? "Loading…" : `${investments.length} total investments`}
          </p>
        </div>

        {/* Summary stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Invested",      val: formatUSD(totalInvested),      color: "var(--gold)" },
              { label: "Total Profit (Est.)", val: formatUSD(totalProfit),        color: "var(--green)" },
              { label: "Current Profit",      val: formatUSD(totalCurrentProfit), color: "var(--teal)" },
              { label: "Active",              val: String(counts.active),         color: "var(--green)" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mb-1">{s.label}</p>
                <p className="font-display text-xl font-bold" style={{ color: s.color }}>{s.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {(["all","active","completed","pending","cancelled"] as FilterStatus[]).map((s) => {
            const clrMap: Record<FilterStatus,string> = { all:"text-[var(--text)]", active:"text-[var(--green)]", completed:"text-[var(--teal)]", pending:"text-[var(--gold)]", cancelled:"text-[var(--red)]" };
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filter===s ? "border-[var(--gold)] bg-[var(--gold-glow)] text-[var(--gold)]" : "glass text-[var(--muted)] hover:border-[var(--border-2)]"}`}>
                <span className={clrMap[s]}>{counts[s]}</span>
                <span className="ml-1.5 capitalize">{s}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-4 py-2.5 flex-1">
            <Search size={14} className="text-[var(--muted)] shrink-0" />
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--muted)] text-[var(--text)]"
              placeholder="Search by user, email or plan…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--muted)]">
            <Filter size={13}/><span>{filtered.length} results</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={28} className="text-[var(--gold)] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl py-16 text-center">
            <TrendingUp size={32} className="text-[var(--muted)] mx-auto mb-3 opacity-30" />
            <p className="text-[var(--muted)] text-sm">No investments found.</p>
          </div>
        ) : (
          <>
            {/* ── Mobile cards ── */}
            <div className="md:hidden space-y-3">
              {filtered.map((inv) => (
                <div key={inv._id} className="glass rounded-2xl p-4 space-y-3">
                  {/* User + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--gold-glow)] border border-[rgba(240,198,66,0.2)] flex items-center justify-center text-[var(--gold)] font-bold text-sm shrink-0">
                        {inv.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{inv.user?.name ?? "—"}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{inv.user?.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>

                  {/* Plan + amount */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Plan</p>
                      <p className="font-bold text-[var(--gold)]">{inv.package?.name ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Invested</p>
                      <p className="font-mono font-bold text-sm">{formatUSD(inv.amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">ROI</p>
                      <p className="font-bold text-[var(--green)]">{inv.profitPercentage}%</p>
                    </div>
                  </div>

                  {/* Profit */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[var(--bg-3)] rounded-lg px-3 py-2">
                      <p className="text-[var(--muted)] text-[9px] uppercase tracking-widest">Current Profit</p>
                      <p className="font-mono font-bold text-[var(--green)] mt-0.5">{formatUSD(inv.currentProfit)}</p>
                    </div>
                    <div className="bg-[var(--bg-3)] rounded-lg px-3 py-2">
                      <p className="text-[var(--muted)] text-[9px] uppercase tracking-widest">Total Profit</p>
                      <p className="font-mono font-bold text-[var(--gold)] mt-0.5">{formatUSD(inv.totalProfit)}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
                      <span>Progress</span>
                      <span>{inv.progress.toFixed(2)}%</span>
                    </div>
                    <ProgressBar value={inv.progress} />
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between text-[10px] text-[var(--muted)]">
                    <span>Start: {fmtDate(inv.startDate)}</span>
                    <span>End: {fmtDate(inv.endDate)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden md:block rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
                      {["User","Plan","Invested","ROI %","Current Profit","Total Profit","Progress","Status","Credited","Start","End"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => (
                      <tr key={inv._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
                        {/* User */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[var(--gold-glow)] border border-[rgba(240,198,66,0.2)] flex items-center justify-center text-[var(--gold)] font-bold text-xs shrink-0">
                              {inv.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold truncate max-w-[120px]">{inv.user?.name ?? "—"}</p>
                              <p className="text-[10px] text-[var(--muted)] truncate max-w-[120px]">{inv.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Plan */}
                        <td className="px-4 py-4">
                          <p className="font-bold text-[var(--gold)]">{inv.package?.name ?? "—"}</p>
                          <p className="text-[10px] text-[var(--muted)]">{inv.package?.duration}d</p>
                        </td>
                        {/* Invested */}
                        <td className="px-4 py-4 font-mono font-bold">{formatUSD(inv.amount)}</td>
                        {/* ROI */}
                        <td className="px-4 py-4 font-bold text-[var(--green)]">{inv.profitPercentage}%</td>
                        {/* Current profit */}
                        <td className="px-4 py-4 font-mono text-[var(--green)]">{formatUSD(inv.currentProfit)}</td>
                        {/* Total profit */}
                        <td className="px-4 py-4 font-mono font-bold text-[var(--gold)]">{formatUSD(inv.totalProfit)}</td>
                        {/* Progress */}
                        <td className="px-4 py-4 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={inv.progress} />
                            <span className="text-[10px] text-[var(--muted)] shrink-0">{inv.progress.toFixed(1)}%</span>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4"><StatusBadge status={inv.status} /></td>
                        {/* Credited */}
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${inv.isCredited ? "text-[var(--green)] border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)]" : "text-[var(--muted)] border-[var(--border)] bg-[var(--bg-3)]"}`}>
                            {inv.isCredited ? "✓ Yes" : "No"}
                          </span>
                        </td>
                        {/* Dates */}
                        <td className="px-4 py-4 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(inv.startDate)}</td>
                        <td className="px-4 py-4 text-xs text-[var(--teal)] whitespace-nowrap">{fmtDate(inv.endDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashLayout>
  );
}
