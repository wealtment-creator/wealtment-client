"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { getUser } from "@/lib/auth";
import { apiGetAllWithdrawals, apiApproveWithdrawal } from "@/lib/api";
import { COIN_PRICES } from "@/lib/data";
import { formatUSD } from "@/lib/utils";
import {
  CheckCircle, Eye, Copy, Search, ArrowUpFromLine, Clock, Filter, Loader,
} from "lucide-react";
import { useAutoScroll } from "@/hooks/useAutoScroll";

import toast from "react-hot-toast";
import type { Withdrawal } from "@/types";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

// Helper: get user name/email from populated or string user field
function userName(w: Withdrawal) {
  return typeof w.user === "object" && w.user !== null ? w.user.name : "—";
}
function userEmail(w: Withdrawal) {
  return typeof w.user === "object" && w.user !== null ? w.user.email : "—";
}

// API returns coinType: "bitcoin" | "litecoin"
function coinLabel(coinType: string) {
  return coinType === "bitcoin" ? "BTC" : "LTC";
}
function coinIcon(coinType: string) {
  return coinType === "bitcoin" ? "₿" : "Ł";
}
function coinColor(coinType: string) {
  return coinType === "bitcoin" ? "#F7931A" : "#345D9D";
}
function coinPrice(coinType: string) {
  return coinType === "bitcoin" ? COIN_PRICES.BTC : COIN_PRICES.LTC;
}

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filter,      setFilter]      = useState<FilterStatus>("all");
  const [search,      setSearch]      = useState("");
  const [viewModal,   setViewModal]   = useState<Withdrawal | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [actionId,    setActionId]    = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    if (!u.isAdmin) { router.replace("/user/dashboard"); return; }
    try {
      // GET /withdrawals  → array (not wrapped in key)
      const res = await apiGetAllWithdrawals();
      // handle both { withdrawals: [] } and plain array
      setWithdrawals(Array.isArray(res) ? res : res.withdrawals ?? res.data ?? []);
    } catch { toast.error("Failed to load withdrawals."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (w: Withdrawal) => {
    setActionId(w._id);
    try {
      // PUT /withdrawals/approve/:id
      await apiApproveWithdrawal(w._id);
      setWithdrawals((p) => p.map((x) => x._id === w._id ? { ...x, status: "approved" } : x));
      setViewModal(null);
      toast.success(`Withdrawal for ${userName(w)} approved!`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Approval failed.");
    } finally { setActionId(null); }
  };

  const copyAddr = (addr: string) => {
    navigator.clipboard.writeText(addr).then(() => toast.success("Address copied!"));
  };

  const filtered = withdrawals.filter((w) => {
    const matchStatus = filter === "all" || w.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      userName(w).toLowerCase().includes(q) ||
      (w.walletAddress ?? "").toLowerCase().includes(q) ||
      w._id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });


  const counts: Record<FilterStatus, number> = {
    all:      withdrawals.length,
    pending:  withdrawals.filter((w) => w.status === "pending").length,
    approved: withdrawals.filter((w) => w.status === "approved").length,
    rejected: withdrawals.filter((w) => w.status === "rejected").length,
  };

  const StatusBadge = ({ status }: { status: Withdrawal["status"] }) => {
    if (status === "approved") return <Badge variant="green"><CheckCircle size={10} /> Approved</Badge>;
    if (status === "rejected") return <Badge variant="red">Rejected</Badge>;
    return <Badge variant="yellow"><Clock size={10} /> Pending</Badge>;
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <DashLayout variant="admin">
      <CryptoTicker />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
              {/* <ArrowUpFromLine className="text-[var(--gold)]" size={24} /> */}
               Withdrawal Requests
            </h1>
            <p className="text-[var(--muted)] text-sm mt-0.5">Review and approve user withdrawal requests.</p>
          </div>
          {counts.pending > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.3)] text-sm shrink-0">
              <Clock size={14} className="text-[var(--gold)]" />
              <span className="font-bold text-[var(--gold)]">{counts.pending}</span>
              <span className="text-[var(--muted)]">pending</span>
            </div>
          )}
        </div>

        {/* Filter pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["all", "pending", "approved", "rejected"] as FilterStatus[]).map((s) => {
            const clr: Record<FilterStatus, string> = { all: "text-[var(--text)]", pending: "text-[var(--gold)]", approved: "text-[var(--green)]", rejected: "text-[var(--red)]" };
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`rounded-xl p-3 border text-left transition-all ${filter === s ? "border-[var(--gold)] bg-[var(--gold-glow)]" : "glass hover:border-[var(--border-2)]"}`}>
                <p className={`text-xl font-display font-bold ${clr[s]}`}>{counts[s]}</p>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-0.5 capitalize">{s}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-4 py-2.5 flex-1">
            <Search size={14} className="text-[var(--muted)] shrink-0" />
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--muted)] text-[var(--text)]"
              placeholder="Search by name or wallet address…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--muted)]">
            <Filter size={13} /><span>{filtered.length} results</span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={28} className="text-[var(--gold)] animate-spin" />
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">

            {/* ── Mobile cards ── */}
            <div  className="md:hidden  divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <p className="text-center text-[var(--muted)] text-sm py-14">No requests found.</p>
              ) : filtered.map((w) => {
                                  const usd = w.amount; // now treat amount as USD
const crypto = usd / coinPrice(w.coinType);
                return (
                  <div key={w._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{userName(w)}</p>
                        <p className="text-xs text-[var(--muted)]">{userEmail(w)}</p>
                      </div>
                      <StatusBadge status={w.status} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg" style={{ color: coinColor(w.coinType) }}> {coinIcon(w.coinType)} {crypto.toFixed(6)} {coinLabel(w.coinType)}</span>
                      <div>
                        <p className="font-mono font-bold text-sm">{w.amount} {coinLabel(w.coinType)}</p>
                        <p className="text-xs text-[var(--muted)]">≈ {formatUSD(usd)}</p>
                      </div>
                    </div>

                    {w.walletAddress && (
                      <div className="flex items-center gap-2 bg-[var(--bg-3)] rounded-lg px-3 py-2">
                        <p className="font-mono text-[10px] text-[var(--teal)] flex-1 truncate">{w.walletAddress}</p>
                        <button onClick={() => copyAddr(w.walletAddress!)} className="text-[var(--muted)] hover:text-[var(--gold)] shrink-0"><Copy size={11} /></button>
                      </div>
                    )}

                    <p className="text-xs text-[var(--muted)]">{fmtDate(w.createdAt)}</p>

                    <div className="flex gap-2">
                      <button onClick={() => setViewModal(w)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[var(--border-2)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors">
                        <Eye size={12} /> Details
                      </button>
                      {w.status === "pending" && (
                        <button onClick={() => handleApprove(w)} disabled={actionId === w._id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[rgba(52,211,153,0.3)] text-[var(--green)] bg-[rgba(52,211,153,0.06)] hover:bg-[rgba(52,211,153,0.14)] transition-colors disabled:opacity-50">
                          {actionId === w._id ? "…" : <><CheckCircle size={12} /> Approve</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto ">
              <table className="w-full  text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
                    {["User", "Coin", "Amount", "USD Value", "Wallet Address", "Date", "Status", "Action"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-16 text-[var(--muted)] text-sm">No requests found.</td></tr>
                  ) : filtered.map((w) => {
                    const usd = w.amount; // now treat amount as USD
const crypto = usd / coinPrice(w.coinType)
                    return (
                      <tr key={w._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold">{userName(w)}</p>
                          <p className="text-xs text-[var(--muted)]">{userEmail(w)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-lg" style={{ color: coinColor(w.coinType) }}>{coinIcon(w.coinType)}</span>
                          <span className="text-xs text-[var(--muted)] ml-1">{coinLabel(w.coinType)}</span>
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-[var(--green)]">
  {formatUSD(usd)}
</td>

{/* Crypto equivalent */}
<td className="px-5 py-4 font-mono">
  <span style={{ color: coinColor(w.coinType) }}>
    {coinIcon(w.coinType)} {crypto.toFixed(6)} {coinLabel(w.coinType)}
  </span>
</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 max-w-[180px]">
                            <span className="font-mono text-[10px] text-[var(--teal)] truncate">{w.walletAddress ?? "—"}</span>
                            {w.walletAddress && (
                              <button onClick={() => copyAddr(w.walletAddress!)} className="text-[var(--muted)] hover:text-[var(--gold)] shrink-0 transition-colors"><Copy size={10} /></button>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(w.createdAt)}</td>
                        <td className="px-5 py-4"><StatusBadge status={w.status} /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setViewModal(w)}
                              className="p-1.5 rounded-lg border border-[var(--border-2)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors">
                              <Eye size={12} />
                            </button>
                            {w.status === "pending" && (
                              <button onClick={() => handleApprove(w)} disabled={actionId === w._id}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[rgba(52,211,153,0.3)] text-[var(--green)] bg-[rgba(52,211,153,0.06)] hover:bg-[rgba(52,211,153,0.14)] transition-colors disabled:opacity-50 flex items-center gap-1">
                                {actionId === w._id ? "…" : <><CheckCircle size={10} /> Approve</>}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
       
            </div>
          </div>
        )}
      </div>

      {/* ── View / Approve Modal ── */}
   <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="Withdrawal Details">
  {viewModal && (
    <div className="space-y-4 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold">{userName(viewModal)}</p>
          <p className="text-xs text-[var(--muted)]">{userEmail(viewModal)}</p>
        </div>
        <StatusBadge status={viewModal.status} />
      </div>

      <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4 space-y-2.5 text-sm">
        {[
          ["Withdrawal ID", viewModal._id],
          ["Coin", coinLabel(viewModal.coinType) + " (" + viewModal.coinType + ")"],

          // ✅ USD FIRST
          ["Amount (USD)", formatUSD(viewModal.amount)],

          // ✅ CRYPTO EQUIVALENT (DIVIDE)
          [
            "Crypto Equivalent",
            `${coinIcon(viewModal.coinType)} ${(viewModal.amount / coinPrice(viewModal.coinType)).toFixed(6)} ${coinLabel(viewModal.coinType)}`
          ],

          ["Requested", fmtDate(viewModal.createdAt)],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <span className="text-[var(--muted)] shrink-0">{k}</span>
            <span className="font-semibold text-right break-all text-xs">{v}</span>
          </div>
        ))}
      </div>

      {/* Wallet address — send funds here */}
      <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mb-2">
          Send Funds to This Wallet
        </p>
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs text-[var(--teal)] break-all flex-1">
            {viewModal.walletAddress ?? "No wallet address provided"}
          </p>
          {viewModal.walletAddress && (
            <button
              onClick={() => copyAddr(viewModal.walletAddress!)}
              className="shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
            >
              <Copy size={13} />
            </button>
          )}
        </div>
      </div>

      {viewModal.status === "pending" && (
        <button
          onClick={() => handleApprove(viewModal)}
          disabled={actionId === viewModal._id}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {actionId === viewModal._id ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              Approving…
            </>
          ) : (
            <>
              <CheckCircle size={15} /> Approve & Mark as Sent
            </>
          )}
        </button>
      )}
    </div>
  )}
</Modal>
    </DashLayout>
  );
}













// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { DashLayout } from "@/components/layout/DashLayout";
// import { Badge } from "@/components/ui/Badge";
// import { Modal } from "@/components/ui/Modal";
// import { Button } from "@/components/ui/Button";
// import { CryptoTicker } from "@/components/ui/CryptoTicker";
// import { getUser } from "@/lib/auth";
// import { apiGetAllWithdrawals, apiApproveWithdrawal } from "@/lib/api";
// import { formatUSD } from "@/lib/utils";
// import { COIN_PRICES } from "@/lib/data";
// import {
//   CheckCircle, Eye, Copy, Search, ArrowUpFromLine, Clock, Filter, Loader,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import type { Withdrawal } from "@/types";

// type FilterStatus = "all" | "pending" | "approved" | "rejected";

// export default function AdminWithdrawalsPage() {
//   const router = useRouter();
//   const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
//   const [filter,      setFilter]      = useState<FilterStatus>("all");
//   const [search,      setSearch]      = useState("");
//   const [viewModal,   setViewModal]   = useState<Withdrawal | null>(null);
//   const [loading,     setLoading]     = useState(true);
//   const [actionId,    setActionId]    = useState<string | null>(null);

//   const fetchData = useCallback(async () => {
//     const u = getUser();
//     if (!u) { router.replace("/login"); return; }
//     if (!u.isAdmin) { router.replace("/user/dashboard"); return; }
//     try {
//       const res = await apiGetAllWithdrawals();
//       setWithdrawals(res.withdrawals ?? []);
//     } catch { toast.error("Failed to load withdrawals."); }
//     finally { setLoading(false); }
//   }, [router]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const handleApprove = async (w: Withdrawal) => {
//     setActionId(w._id);
//     try {
//       // PUT /withdrawals/:id/approve
//       await apiApproveWithdrawal(w._id);
//       setWithdrawals((p) => p.map((x) => x._id === w._id ? { ...x, status: "approved" } : x));
//       setViewModal(null);
//       toast.success(`Withdrawal for ${w.user?.name ?? "user"} approved!`);
//     } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Approval failed."); }
//     finally { setActionId(null); }
//   };

//   const copyAddr = (addr: string) => {
//     navigator.clipboard.writeText(addr).then(() => toast.success("Address copied!"));
//   };

//   const filtered = withdrawals.filter((w) => {
//     const matchStatus = filter === "all" || w.status === filter;
//     const q = search.toLowerCase();
//     const wallet = w.coin === "BTC" ? w.user?.bitcoinAddress : w.user?.litecoinAddress;
//     const matchSearch = !q || (w.user?.name ?? "").toLowerCase().includes(q) || (wallet ?? "").toLowerCase().includes(q) || w._id.toLowerCase().includes(q);
//     return matchStatus && matchSearch;
//   });

//   const counts: Record<FilterStatus, number> = {
//     all:      withdrawals.length,
//     pending:  withdrawals.filter((w) => w.status === "pending").length,
//     approved: withdrawals.filter((w) => w.status === "approved").length,
//     rejected: withdrawals.filter((w) => w.status === "rejected").length,
//   };

//   const statusBadge = (s: Withdrawal["status"]) => {
//     if (s === "approved") return <Badge variant="green"><CheckCircle size={10} /> Approved</Badge>;
//     if (s === "rejected") return <Badge variant="red">Rejected</Badge>;
//     return <Badge variant="yellow"><Clock size={10} /> Pending</Badge>;
//   };

//   const fmtDate = (iso: string) =>
//     new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

//   const walletOf = (w: Withdrawal) =>
//     w.coin === "BTC" ? w.user?.bitcoinAddress : w.user?.litecoinAddress;

//   return (
//     <DashLayout variant="admin">
//       <CryptoTicker />
//       <div className="p-4 sm:p-6 lg:p-8 space-y-6">

//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//           <div>
//             <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
//               <ArrowUpFromLine className="text-[var(--gold)]" size={24} /> Withdrawal Requests
//             </h1>
//             <p className="text-[var(--muted)] text-sm mt-0.5">Review and process user withdrawal requests.</p>
//           </div>
//           {counts.pending > 0 && (
//             <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.3)] text-sm shrink-0">
//               <Clock size={14} className="text-[var(--gold)]" />
//               <span className="font-bold text-[var(--gold)]">{counts.pending}</span>
//               <span className="text-[var(--muted)]">pending</span>
//             </div>
//           )}
//         </div>

//         {/* Filter pills */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           {(["all","pending","approved","rejected"] as FilterStatus[]).map((s) => {
//             const colors: Record<FilterStatus, string> = { all: "text-[var(--text)]", pending: "text-[var(--gold)]", approved: "text-[var(--green)]", rejected: "text-[var(--red)]" };
//             return (
//               <button key={s} onClick={() => setFilter(s)} className={`rounded-xl p-3 border text-left transition-all ${filter === s ? "border-[var(--gold)] bg-[var(--gold-glow)]" : "glass hover:border-[var(--border-2)]"}`}>
//                 <p className={`text-xl font-display font-bold ${colors[s]}`}>{counts[s]}</p>
//                 <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-0.5 capitalize">{s}</p>
//               </button>
//             );
//           })}
//         </div>

//         {/* Search */}
//         <div className="flex flex-col sm:flex-row gap-3">
//           <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-4 py-2.5 flex-1">
//             <Search size={14} className="text-[var(--muted)] shrink-0" />
//             <input className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--muted)] text-[var(--text)]" placeholder="Search by name or address…" value={search} onChange={(e) => setSearch(e.target.value)} />
//           </div>
//           <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--muted)]">
//             <Filter size={13} /><span>{filtered.length} results</span>
//           </div>
//         </div>

//         {/* Table */}
//         {loading ? (
//           <div className="flex items-center justify-center py-20"><Loader size={28} className="text-[var(--gold)] animate-spin" /></div>
//         ) : (
//           <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
//             {/* Mobile cards */}
//             <div className="md:hidden divide-y divide-[var(--border)]">
//               {filtered.length === 0 ? (
//                 <p className="text-center text-[var(--muted)] text-sm py-14">No requests found.</p>
//               ) : filtered.map((w) => {
//                 const wallet = walletOf(w);
//                 const usd = w.amount * (COIN_PRICES[w.coin] ?? 0);
//                 return (
//                   <div key={w._id} className="p-4 space-y-3">
//                     <div className="flex items-start justify-between gap-2">
//                       <div><p className="font-semibold text-sm">{w.user?.name ?? "User"}</p><p className="text-xs text-[var(--muted)]">{w.user?.email}</p></div>
//                       {statusBadge(w.status)}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="font-bold text-lg" style={{ color: w.coin === "BTC" ? "#F7931A" : "#345D9D" }}>{w.coin === "BTC" ? "₿" : "Ł"}</span>
//                       <div><p className="font-mono font-bold text-sm">{w.amount} {w.coin}</p><p className="text-xs text-[var(--muted)]">≈ {formatUSD(usd)}</p></div>
//                     </div>
//                     {wallet && (
//                       <div className="flex items-center gap-2 bg-[var(--bg-3)] rounded-lg px-3 py-2">
//                         <p className="font-mono text-[10px] text-[var(--teal)] flex-1 truncate">{wallet}</p>
//                         <button onClick={() => copyAddr(wallet)} className="text-[var(--muted)] hover:text-[var(--gold)] shrink-0"><Copy size={11} /></button>
//                       </div>
//                     )}
//                     <p className="text-xs text-[var(--muted)]">{fmtDate(w.createdAt)}</p>
//                     {w.status === "pending" && (
//                       <Button size="sm" onClick={() => handleApprove(w)} loading={actionId === w._id} className="w-full">
//                         <CheckCircle size={13} /> Approve & Send to Wallet
//                       </Button>
//                     )}
//                     {w.status !== "pending" && (
//                       <button onClick={() => setViewModal(w)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[var(--border-2)] text-[var(--muted)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
//                         <Eye size={12} /> View Details
//                       </button>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Desktop table */}
//             <div className="hidden md:block overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
//                     {["User","Coin","Amount","USD Value","Wallet Address","Date","Status","Action"].map((h) => (
//                       <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] whitespace-nowrap">{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.length === 0 ? (
//                     <tr><td colSpan={8} className="text-center py-16 text-[var(--muted)] text-sm">No requests found.</td></tr>
//                   ) : filtered.map((w) => {
//                     const wallet = walletOf(w);
//                     const usd = w.amount * (COIN_PRICES[w.coin] ?? 0);
//                     return (
//                       <tr key={w._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
//                         <td className="px-5 py-4"><p className="font-semibold">{w.user?.name ?? "—"}</p><p className="text-xs text-[var(--muted)]">{w.user?.email}</p></td>
//                         <td className="px-5 py-4"><span className="font-bold text-base" style={{ color: w.coin === "BTC" ? "#F7931A" : "#345D9D" }}>{w.coin === "BTC" ? "₿" : "Ł"}</span> <span className="text-xs text-[var(--muted)]">{w.coin}</span></td>
//                         <td className="px-5 py-4 font-mono font-bold">{w.amount}</td>
//                         <td className="px-5 py-4 font-mono text-[var(--green)]">{formatUSD(usd)}</td>
//                         <td className="px-5 py-4">
//                           <div className="flex items-center gap-1.5 max-w-[180px]">
//                             <span className="font-mono text-[10px] text-[var(--teal)] truncate">{wallet ?? "—"}</span>
//                             {wallet && <button onClick={() => copyAddr(wallet)} className="text-[var(--muted)] hover:text-[var(--gold)] shrink-0 transition-colors"><Copy size={10} /></button>}
//                           </div>
//                         </td>
//                         <td className="px-5 py-4 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(w.createdAt)}</td>
//                         <td className="px-5 py-4">{statusBadge(w.status)}</td>
//                         <td className="px-5 py-4">
//                           <div className="flex items-center gap-1.5">
//                             <button onClick={() => setViewModal(w)} className="p-1.5 rounded-lg border border-[var(--border-2)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"><Eye size={12} /></button>
//                             {w.status === "pending" && (
//                               <button onClick={() => handleApprove(w)} disabled={actionId === w._id}
//                                 className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[rgba(52,211,153,0.3)] text-[var(--green)] bg-[rgba(52,211,153,0.06)] hover:bg-[rgba(52,211,153,0.14)] transition-colors disabled:opacity-50 flex items-center gap-1">
//                                 {actionId === w._id ? "…" : <><CheckCircle size={10} />Approve</>}
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* View Modal */}
//       <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="Withdrawal Details">
//         {viewModal && (() => {
//           const wallet = walletOf(viewModal);
//           const usd = viewModal.amount * (COIN_PRICES[viewModal.coin] ?? 0);
//           return (
//             <div className="space-y-4 mt-2">
//               <div className="flex items-center justify-between">
//                 <div><p className="font-bold">{viewModal.user?.name ?? "User"}</p><p className="text-xs text-[var(--muted)]">{viewModal.user?.email}</p></div>
//                 {statusBadge(viewModal.status)}
//               </div>
//               <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4 space-y-2.5 text-sm">
//                 {[["Coin", viewModal.coin === "BTC" ? "Bitcoin (BTC)" : "Litecoin (LTC)"], ["Amount", `${viewModal.amount} ${viewModal.coin}`], ["USD Value", formatUSD(usd)], ["Requested", fmtDate(viewModal.createdAt)]].map(([k, v]) => (
//                   <div key={k} className="flex justify-between"><span className="text-[var(--muted)]">{k}</span><span className="font-semibold">{v}</span></div>
//                 ))}
//               </div>
//               {wallet && (
//                 <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4">
//                   <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mb-2">Wallet Address (send funds here)</p>
//                   <div className="flex items-center gap-2">
//                     <p className="font-mono text-xs text-[var(--teal)] break-all flex-1">{wallet}</p>
//                     <button onClick={() => copyAddr(wallet)} className="shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
//                       <Copy size={13} />
//                     </button>
//                   </div>
//                 </div>
//               )}
//               {viewModal.status === "pending" && (
//                 <Button size="lg" onClick={() => handleApprove(viewModal)} loading={actionId === viewModal._id} className="w-full">
//                   <CheckCircle size={15} /> Approve & Mark as Sent
//                 </Button>
//               )}
//             </div>
//           );
//         })()}
//       </Modal>
//     </DashLayout>
//   );
// }




