
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { getUser } from "@/lib/auth";
import { apiGetAllDeposits,  apiApproveDeposit } from "@/lib/api";
import { COIN_PRICES } from "@/lib/data";
import { formatUSD } from "@/lib/utils";
import {
  CheckCircle, Eye, Search, Clock, Filter, Loader, DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

import type { Deposit } from "@/types";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

function userName(d: Deposit) {
  return typeof d.user === "object" && d.user !== null ? d.user.name : "—";
}

function userEmail(w: Deposit) {
  return typeof w.user === "object" && w.user !== null ? w.user.email : "—";
}
function userId(d: Deposit) {
  return typeof d.user === "object" && d.user !== null ? d.user._id : d.user;
}
// function userName(w: Withdrawal) {
  

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

export default function AdminDepositsPage() {
  const router = useRouter();
  const [deposits,  setDeposits]  = useState<Deposit[]>([]);
  const [filter,    setFilter]    = useState<FilterStatus>("all");
  const [search,    setSearch]    = useState("");
  const [viewModal, setViewModal] = useState<Deposit | null>(null);
  const [fundAmount,setFundAmount]= useState("");
  const [loading,   setLoading]   = useState(true);
  const [actionId,  setActionId]  = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    if (!u.isAdmin) { router.replace("/user/dashboard"); return; }
    try {
      const res = await apiGetAllDeposits();
      setDeposits(Array.isArray(res) ? res : res.deposits ?? res.data ?? []);
    } catch { toast.error("Failed to load deposits."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Pre-fill amount when opening modal
  const openModal = (d: Deposit) => {
    setViewModal(d);
    setFundAmount(String(d.amount));
  };

  //  const handleFundUser = async () => {
  //   if (!viewModal) return;
  //   const amt = parseFloat(fundAmount);
  //   if (!amt || amt <= 0) { toast.error("Enter a valid amount."); return; }
  //   const uid = userId(viewModal);
  //   if (!uid) { toast.error("User ID not found."); return; }
  //   setActionId(viewModal._id);
  //   try {
  //     // PUT /admin/fund-user/:userId  body: { amount }
  //     await apiApproveDeposit(viewModal._id);
  //     setDeposits((p) => p.map((x) => x._id === viewModal._id ? { ...x, status: "approved" } : x));
  //     setViewModal(null);
  //     toast.success(`${userName(viewModal)} funded with ${amt} ${`$`}!`);
  //   } catch (e: unknown) {
  //     toast.error(e instanceof Error ? e.message : "Fund failed.");
  //   } finally { setActionId(null); }
  // };
    const [description, setDescription] = useState("");

   const handleFundUser = async () => {
    if (!viewModal) return;
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount."); return; }
    const uid = userId(viewModal);
    if (!uid) { toast.error("User ID not found."); return; }
    setActionId(viewModal._id);
    try {
      // PUT /admin/fund-user/:userId  body: { amount }
      await apiApproveDeposit(viewModal._id, description);
      setDeposits((p) => p.map((x) => x._id === viewModal._id ? { ...x, status: "approved" } : x));
      setViewModal(null);
      toast.success(`${userName(viewModal)} funded with ${amt} ${`$`}!`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Fund failed.");
    } finally { setActionId(null); }
  };

  const filtered = deposits.filter((d) => {
    const matchStatus = filter === "all" || d.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      userName(d).toLowerCase().includes(q) ||
      userEmail(d).toLowerCase().includes(q) ||
      d._id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
    const ROWS = 2; // how many to show at once

  const counts: Record<FilterStatus, number> = {
    all:      deposits.length,
    pending:  deposits.filter((d) => d.status === "pending").length,
    approved: deposits.filter((d) => d.status === "approved").length,
    rejected: deposits.filter((d) => d.status === "rejected").length,
  };

  const StatusBadge = ({ status }: { status: Deposit["status"] }) => {
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
        <div >
           
         <div   className="flex mb-2  flex-col sm:flex-row sm:items-center justify-between gap-3">
             <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
              {/* <ArrowDownToLine className="text-[var(--gold)]" size={24} /> */}
               Deposit Requests
            </h1>
            <p className="text-[var(--muted)] text-sm mt-0.5">Review and fund user deposit requests.</p>
          </div>
         </div>

          
          {counts.pending > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.3)] text-sm shrink-0">
              <Clock size={14} className="text-[var(--gold)]" />
              <span className="font-bold text-[var(--gold)]">{counts.pending}</span>
              <span className="text-[var(--muted)]">pending</span>
            </div>
          )}
        </div>
        {!loading && deposits.filter(d => d.status === "approved").length > 0 && (
  <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[rgba(52,211,153,0.06)] border border-[rgba(52,211,153,0.2)]">
    <CheckCircle size={20} className="text-[var(--green)] shrink-0" />
    <div>
      <p className="text-xs text-[var(--muted)] uppercase tracking-widest">Total Verified Deposits</p>
      <p className="font-display text-2xl font-bold text-[var(--green)]">
        {formatUSD(deposits.filter(d => d.status === "approved").reduce((s, d) => s + d.amount, 0))}
      </p>
    </div>
    <div className="ml-auto text-right">
      <p className="text-xs text-[var(--muted)]">{counts.approved} deposits</p>
    </div>
  </div>
)}



        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3">
          {(["all", "pending", "approved"] as FilterStatus[]).map((s) => {
            const label: Record<FilterStatus, string> = { all: "All", pending: "Pending", approved: "Approved", rejected: "Rejected" };
            const active = filter === s;
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${active ? "bg-[var(--gold)] text-black shadow-sm" : "border border-[var(--border)] bg-[var(--bg-3)] text-[var(--text)] hover:border-[var(--gold)]"}`}>
                {label[s]} {counts[s] !== undefined ? `(${counts[s]})` : ""}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-4 py-2.5 flex-1">
            <Search size={14} className="text-[var(--muted)] shrink-0" />
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--muted)] text-[var(--text)]"
              placeholder="Search by name or email…"
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
           <div className="rounded-2xl w-full border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
          
                      {/* ── Mobile cards ── */}
                      <div  className="md:hidden  divide-y divide-[var(--border)]">
                        {filtered.length === 0 ? (
                          <p className="text-center text-[var(--muted)] text-sm py-14">No deposits found.</p>
                        ) :  filtered.map((d) => {
                         const usd = d.amount; 
          const crypto = usd / coinPrice(d.coinType);
                          return (
                            <div key={d._id} className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-sm">{userName(d)}</p>
                                  <p className="text-xs text-[var(--muted)]">{userEmail(d)}</p>
                                </div>
                                <StatusBadge status={d.status} />
                              </div>
                              {/*  */}
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg" style={{ color: coinColor(d.coinType) }}>{coinIcon(d.coinType)}</span>
                                <div>
                                  <p className="font-mono font-bold text-sm">{coinIcon(d.coinType)} {crypto.toFixed(6)} {coinLabel(d.coinType)}</p>
                                  <p className="text-xs text-[var(--muted)]">≈ {formatUSD(usd)}</p>
                                </div>
                              </div>
                              <p className="text-xs text-[var(--muted)]">{fmtDate(d.createdAt)}</p>
                              <div className="flex gap-2">
                                <button onClick={() => openModal(d)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[var(--border-2)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors">
                                  <Eye size={12} /> Details
                                </button>
                                {d.status === "pending" && (
                                  <button onClick={() => openModal(d)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[rgba(52,211,153,0.3)] text-[var(--green)] bg-[rgba(52,211,153,0.06)] hover:bg-[rgba(52,211,153,0.14)] transition-colors">
                                    <DollarSign size={12} /> Fund User
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
          
                      {/* ── Desktop table ── */}
                      <div className="hidden  md:block overflow-x-auto overflow-hidden h-[200px]">
                        <table   className="w-full text-sm 
    ">
                          <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
                              {["User", "Coin", "Amount", "Coin Value", "Date", "Status", "Action"].map((h) => (
                                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.length === 0 ? (
                              <tr><td colSpan={7} className="text-center py-16 text-[var(--muted)] text-sm">No deposits found.</td></tr>
                            ) : filtered.map((d) => {
                             const usd = d.amount; // now treat amount as USD
          const crypto = usd / coinPrice(d.coinType);
          
          
          
                              return (
                                <tr key={d._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
                                  <td className="px-5 py-4">
                                    <p className="font-semibold">{userName(d)}</p>
                                    <p className="text-xs text-[var(--muted)]">{userEmail(d)}</p>
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className="font-bold text-lg" style={{ color: coinColor(d.coinType) }}>{coinIcon(d.coinType)}</span>
                                    <span className="text-xs text-[var(--muted)] ml-1">{coinLabel(d.coinType)}</span>
                                  </td>
                                  {/* USD (main value) */}
          <td className="px-5 py-4 font-mono font-bold text-[var(--green)]">
            {formatUSD(usd)}
          </td>
          
          {/* Crypto equivalent */}
          <td className="px-5 py-4 font-mono">
            <span style={{ color: coinColor(d.coinType) }}>
              {coinIcon(d.coinType)} {crypto.toFixed(6)} {coinLabel(d.coinType)}
            </span>
          </td>
                                  {/* <td className="px-5 py-4 font-mono font-bold">{d.amount}</td>
                                  <td className="px-5 py-4 font-mono text-[var(--green)]">{formatUSD(usd)}</td> */}
                                  <td className="px-5 py-4 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(d.createdAt)}</td>
                                  <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-1.5">
                                      <button onClick={() => openModal(d)}
                                        className="p-1.5 rounded-lg border border-[var(--border-2)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors">
                                        <Eye size={12} />
                                      </button>
                                      {d.status === "pending" && (
                                        <button onClick={() => openModal(d)} disabled={actionId === d._id}
                                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[rgba(52,211,153,0.3)] text-[var(--green)] bg-[rgba(52,211,153,0.06)] hover:bg-[rgba(52,211,153,0.14)] transition-colors disabled:opacity-50 flex items-center gap-1">
                                          <DollarSign size={10} /> Fund User
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

      {/* ── Fund User Modal ── */}
    <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="Deposit Details & Fund User">
  {viewModal && (
    <div className="space-y-4 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold">{userName(viewModal)}</p>
          <p className="text-xs text-[var(--muted)]">{userEmail(viewModal)}</p>
        </div>
        <StatusBadge status={viewModal.status} />
      </div>

        <p className="text-sm text-[var(--muted)]">
        Add a note  (optional).
      </p>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. Sent via Binance, TXID: 123abc..."
        className="w-full h-28 p-3 rounded-xl bg-[var(--bg-3)] border border-[var(--border)] text-sm outline-none focus:border-[var(--gold)] resize-none"
      />

      {/* Deposit info */}
      <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4 space-y-2.5 text-sm">
        {[
          ["Deposit ID", viewModal._id],
          ["Coin", coinLabel(viewModal.coinType) + " (" + viewModal.coinType + ")"],

          // ✅ NOW USD FIRST
          ["Requested (USD)", formatUSD(viewModal.amount)],

          // ✅ CRYPTO EQUIVALENT (DIVIDE)
          [
            "Crypto Equivalent",
            `${coinIcon(viewModal.coinType)} ${(viewModal.amount / coinPrice(viewModal.coinType)).toFixed(6)} ${coinLabel(viewModal.coinType)}`
          ],

          ["Date", fmtDate(viewModal.createdAt)],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <span className="text-[var(--muted)] shrink-0">{k}</span>
            <span className="font-semibold text-right break-all text-xs">{v}</span>
          </div>
        ))}
      </div>

      {/* Fund user — only for pending */}
      {viewModal.status === "pending" && (
        <>
          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--muted)] mb-1">
              Amount to Credit (USD — editable)
            </p>

            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full px-4 py-3 pr-16 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors font-mono"
              />

              {/* you can keep coin label OR change to $ if you want */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--gold)]">
                $
              </span>
            </div>

            {/* ✅ SHOW CRYPTO EQUIVALENT (DIVIDE, NOT MULTIPLY) */}
            {parseFloat(fundAmount) > 0 && (
              <p className="text-xs text-[var(--muted)] mt-1.5">
                ≈{" "}
                <span className="text-[var(--green)] font-semibold">
                  {(parseFloat(fundAmount) / coinPrice(viewModal.coinType)).toFixed(6)}{" "}
                  {coinLabel(viewModal.coinType)}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={handleFundUser}
            disabled={actionId === viewModal._id}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {actionId === viewModal._id ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                <DollarSign size={15} /> Fund User Account
              </>
            )}
          </button>
        </>
      )}
    </div>
  )}
</Modal>
    </DashLayout>
  );
}

