"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { getUser } from "@/lib/auth";
// ─── Add these two to your api.ts ────────────────────────────────────────────
// export const apiGetReferrals = () =>
//   endpointRoute.get("/user/referrals").then((r) => r.data);
//
// export const apiTransferReferral = (amount: string) =>
//   endpointRoute.post("/user/transfer-referral", { amount }).then((r) => r.data);
// ─────────────────────────────────────────────────────────────────────────────
import { apiGetReferrals, apiTransferReferral } from "@/lib/api";
import { formatUSD } from "@/lib/utils";
import {
  Users, TrendingUp, Copy, CheckCircle,
  Loader, DollarSign, Gift, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface Referral {
  _id: string;
  name: string;
  email: string;
  hasInvested: boolean;
  createdAt: string;
}

interface ReferralsData {
  totalReferrals: number;
  totalEarnings: number;
  referrals: Referral[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function ReferralsPage() {
  const router = useRouter();
  const [data,         setData]         = useState<ReferralsData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [transferAmt,  setTransferAmt]  = useState("");
  const [transferring, setTransferring] = useState(false);
  const [copied,       setCopied]       = useState(false);
console.log('referrals data', data)
  // Build referral link from logged-in user id
  const user = getUser();
  const referralLink =
    typeof window !== "undefined" && user
      ? `${window.location.origin}/signup?ref=${user.name}`
      : "";

  const load = async () => {
    setLoading(true);
    try {
      // GET /user/referrals
      const res = await apiGetReferrals();
      setData(res);
    } catch {
      toast.error("Failed to load referrals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    load();
  }, [router]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success("Referral link copied!");
    });
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmt);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount."); return; }
    if (data && amt > data.totalEarnings) {
      toast.error(`Max transferable is ${formatUSD(data.totalEarnings)}`);
      return;
    }
    setTransferring(true);
    try {
      // POST /user/transfer-referral  { amount: "10" }
      await apiTransferReferral(transferAmt);
      toast.success(`${formatUSD(amt)} referral bonus transferred to your account!`);
      setTransferAmt("");
      await load(); // refresh to update earnings
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Transfer failed.");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <DashLayout variant="user">
      <CryptoTicker />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Gift className="text-[var(--gold)]" size={26} />
              Referral Program
            </h1>
            <p className="text-[var(--muted)] text-sm mt-0.5">
              Invite friends and earn bonuses on their investments.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-2)] text-[var(--muted)] text-xs font-bold hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={28} className="text-[var(--gold)] animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Total referrals */}
              <div className="glass rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(212,168,67,0.03)] pointer-events-none" />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-[var(--gold-glow)] text-[var(--gold)]">
                  <Users size={18} />
                </div>
                <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)] mb-1">Total Referrals</p>
                <p className="font-display text-3xl font-bold text-[var(--gold)]">
                  {data?.totalReferrals ?? 0}
                </p>
              </div>

              {/* Total earnings */}
              <div className="glass rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(52,211,153,0.03)] pointer-events-none" />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-[rgba(52,211,153,0.1)] text-[var(--green)]">
                  <TrendingUp size={18} />
                </div>
                <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)] mb-1">Total Earnings</p>
                <p className="font-display text-3xl font-bold text-[var(--green)]">
                  {formatUSD(data?.totalEarnings ?? 0)}
                </p>
              </div>
            </div>

            {/* ── Referral link ── */}
            <div className="glass rounded-2xl p-5 sm:p-6 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Gift size={15} className="text-[var(--gold)]" />
                Your Referral Link
              </p>
              <p className="text-xs text-[var(--muted)]">
                Share this link. When your friend signs up and invests, you earn a bonus automatically.
              </p>
              <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-4 py-3">
                <p className="font-mono text-xs text-[var(--teal)] flex-1 truncate">{referralLink || "Loading…"}</p>
                <button
                  onClick={copyLink}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    copied
                      ? "border-[var(--green)] text-[var(--green)] bg-[rgba(52,211,153,0.08)]"
                      : "border-[var(--border-2)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  }`}
                >
                  {copied ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>

            {/* ── Transfer referral bonus ── */}
            {(data?.totalEarnings ?? 0) > 0 && (
              <div className="glass rounded-2xl p-5 sm:p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign size={15} className="text-[var(--gold)]" />
                    Withdraw Referral Bonus to Account
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Transfer your referral earnings to your main balance.
                    Available: <strong className="text-[var(--green)]">{formatUSD(data?.totalEarnings ?? 0)}</strong>
                  </p>
                </div>
                <form onSubmit={handleTransfer} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max={data?.totalEarnings}
                      placeholder={`Max ${formatUSD(data?.totalEarnings ?? 0)}`}
                      value={transferAmt}
                      onChange={(e) => setTransferAmt(e.target.value)}
                      className="w-full px-4 py-3 pr-14 rounded-xl bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)] font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--gold)]">USD</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransferAmt(String(data?.totalEarnings ?? ""))}
                    className="px-4 py-3 rounded-xl border border-[var(--border-2)] text-[var(--muted)] text-xs font-bold hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors whitespace-nowrap"
                  >
                    Use Max
                  </button>
                  <button
                    type="submit"
                    disabled={transferring || !transferAmt}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {transferring
                      ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> Transferring…</>
                      : <><DollarSign size={15} /> Transfer to Account</>
                    }
                  </button>
                </form>
              </div>
            )}

            {/* ── Referrals table ── */}
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
              <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Users size={15} className="text-[var(--gold)]" />
                  My Referrals
                </h2>
                <span className="text-xs font-bold text-[var(--gold)] bg-[var(--gold-glow)] px-2.5 py-0.5 rounded-full">
                  {data?.totalReferrals ?? 0} total
                </span>
              </div>

              {!data?.referrals?.length ? (
                <div className="py-16 text-center">
                  <Users size={32} className="text-[var(--muted)] mx-auto mb-3 opacity-30" />
                  <p className="text-[var(--muted)] font-semibold text-sm">No referrals yet.</p>
                  <p className="text-[var(--muted)] text-xs mt-1">Share your referral link to start earning!</p>
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-[var(--border)]">
                    {data.referrals.map((r) => (
                      <div key={r._id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[var(--gold-glow)] border border-[rgba(212,168,67,0.2)] flex items-center justify-center text-[var(--gold)] font-bold text-sm shrink-0">
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{r.name}</p>
                              <p className="text-xs text-[var(--muted)] truncate">{r.email}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                            r.hasInvested
                              ? "text-[var(--green)] border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)]"
                              : "text-[var(--muted)] border-[var(--border)] bg-[var(--bg-3)]"
                          }`}>
                            {r.hasInvested ? "✓ Invested" : "Not yet"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)]">Joined {fmtDate(r.createdAt)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
                          {["User", "Email", "Invested?", "Joined"].map((h) => (
                            <th key={h} className="text-left px-6 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.referrals.map((r) => (
                          <tr key={r._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
                            {/* Avatar + name */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--gold-glow)] border border-[rgba(212,168,67,0.2)] flex items-center justify-center text-[var(--gold)] font-bold text-xs shrink-0">
                                  {r.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold">{r.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[var(--muted)] text-xs">{r.email}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                r.hasInvested
                                  ? "text-[var(--green)] border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)]"
                                  : "text-[var(--muted)] border-[var(--border)] bg-[var(--bg-3)]"
                              }`}>
                                {r.hasInvested ? "✓ Invested" : "Not yet"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-[var(--muted)]">{fmtDate(r.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </DashLayout>
  );
}
