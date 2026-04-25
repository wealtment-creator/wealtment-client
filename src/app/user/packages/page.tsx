"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { getUser } from "@/lib/auth";
import { apiGetPlans, apiInvest, apiGetMyInvestments, apiGetCryptoPrices } from "@/lib/api";
import { DEPOSIT_ADDRESSES } from "@/lib/data";
import { formatUSD, formatCoinPrice } from "@/lib/utils";
import { Copy, CheckCircle, Package, Info, Loader } from "lucide-react";
import type { User, Plan, Investment } from "@/types";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function UserPackagesPage() {
  const router = useRouter();
  const [user,        setUser]        = useState<User | null>(null);
  const [plans,       setPlans]       = useState<Plan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selected,    setSelected]    = useState<Plan | null>(null);
  const [coin,        setCoin]        = useState<"BTC" | "LTC">("BTC");
  const [amount,      setAmount]      = useState("");
  const [copied,      setCopied]      = useState(false);
  const [sending,     setSending]     = useState(false);
  const [loadingPlans,setLoadingPlans]= useState(true);
  const [prices,      setPrices]      = useState<{bitcoin: {usd: number}, litecoin: {usd: number}} | null>(null);

  const load = async (u: User) => {
    try {
      const [pr, ir] = await Promise.all([apiGetPlans(), apiGetMyInvestments()]);
      console.log("ir", ir);
      setPlans(pr.packages ?? []);
      const investmentsData = Array.isArray(ir)
        ? ir
        : ir.investments ?? ir.data ?? [];
      setInvestments(investmentsData);
    } catch {
      toast.error("Failed to load plans.");
      setInvestments([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
    load(u);
    apiGetCryptoPrices().then(setPrices).catch(() => setPrices(null));
  }, [router]);

  const copy = (addr: string) => {
    navigator.clipboard.writeText(addr).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); toast.success("Copied!"); });
  };

  const handleInvest = async () => {
    if (!selected || !amount || Number(amount) <= 0) { toast.error("Enter a valid amount."); return; }
    const min = selected.minAmount ?? selected.min ?? 0;
    if (Number(amount) < min) { toast.error(`Minimum is ${formatUSD(min)}`); return; }
    setSending(true);
    try {
      await apiInvest(selected._id? selected._id : '', Number(amount));
      console.log(selected._id, Number(amount));
      const ir = await apiGetMyInvestments();
      const investmentsData = Array.isArray(ir)
        ? ir
        : ir.investments ?? ir.data ?? [];
      setInvestments(investmentsData);
      setSelected(null);
      setAmount("");
      await Swal.fire({
        title: "🎉 Investment Created!",
        html: `<p style="color:#94a3b8;margin-top:8px">Invested <strong style="color:#d4a843">${formatUSD(Number(amount))}</strong> in <strong style="color:#d4a843">${selected.name}</strong>. Send your deposit to the address shown and it activates within 24h.</p>`,
        icon: "success", background: "#0b1623", color: "#e8edf5", confirmButtonColor: "#d4a843", confirmButtonText: "Got it!",
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Investment failed.");
    } finally { setSending(false); }
  };

  if (!user) return null;

  const rate   = (p: Plan) => p.profitPercentage ?? p.returnRate ?? p.pct ?? 0;
  const minAmt = (p: Plan) => p.minimumDeposit ?? p.minAmount ?? p.min ?? 0;
  const maxAmt = (p: Plan) => p.maximumDeposit ?? p.maxAmount ?? p.max ?? null;
  const durationLabel = (p: Plan) => {
    if (typeof p.duration === "string") return p.duration;
    if (typeof p.duration === "number") return `${p.duration} days`;
    if (p.days != null) return `${p.days}d`;
    return "—";
  };
  console.log('plans', plans, 'investments', investments);
  const active = (p: Plan) => investments.find((i) => (i.planId === p._id || i.package?._id === p._id) && (i.status === "active" || i.status === "pending"));

  return (
    <DashLayout variant="user">
      <CryptoTicker />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Investment Plans</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">Choose a plan and start growing your capital.</p>
        </div>

        {loadingPlans ? (
          <div className="flex items-center justify-center py-20"><Loader size={28} className="text-[var(--gold)] animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {plans.map((p) => {
              const isActive = active(p);
              return (
                <div key={p._id} className={`relative rounded-2xl p-5 sm:p-6 flex flex-col transition-all hover:-translate-y-1 ${isActive ? "border-2 border-[var(--gold)] bg-[rgba(212,168,67,0.06)]" : p.featured ? "border border-[var(--gold)] bg-gradient-to-b from-[rgba(212,168,67,0.05)] to-[var(--bg-card)]" : "glass hover:border-[var(--gold)]"}`}>
                  {isActive && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--gold)] text-black whitespace-nowrap">Active</span>}
                  {p.featured && !isActive && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black whitespace-nowrap">Popular</span>}
                  {/* <p className="text-[10px] font-bold tracking-[2px] uppercase text-[var(--muted)] mb-3">{p.name}</p>
                  <p className="font-display text-4xl sm:text-5xl font-black text-[var(--gold)]">{rate(p)}%</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 mb-1">ROI</p>
                  <p className="text-sm font-semibold text-[var(--teal)] mb-4">After {durationLabel(p)}</p>
                  <div className="border-t border-[var(--border)] pt-3 space-y-2 flex-1">
                    {[["Min", formatUSD(minAmt(p))], ["Max", maxAmt(p) ? formatUSD(maxAmt(p)!) : "Unlimited"], ["Duration", durationLabel(p)]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs sm:text-sm"><span className="text-[var(--muted)]">{k}</span><span className="font-semibold">{v}</span></div>
                    ))}
                  </div> */}

                   <button className="text-[10px] font-bold p-3 rounded-full tracking-[2px] uppercase text-center text-lg  text-black mb-3 bg-[var(--gold)]">{p.name}</button>
                  <p className="font-display text-4xl sm:text-5xl font-black text-[var(--gold)]">{rate(p)}%</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 mb-1">ROI</p>
                  <p className="text-lg font-semibold text-[var(--teal)] mb-4">After {durationLabel(p)}</p>
                  <div className="border-t border-[var(--border)] pt-3 space-y-2 flex-1">
                    {[["Min", formatUSD(minAmt(p))], ["Max", maxAmt(p) ? formatUSD(maxAmt(p)!) : "Unlimited"], ["Duration", durationLabel(p)]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs sm:text-sm"><span className="text-[var(--muted)]">{k}</span><span className="font-semibold">{v}</span></div>
                    ))}
                  </div>
                  <button onClick={() => { setSelected(p); setAmount(String(minAmt(p))); setCopied(false); }} className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity">
                    {isActive ? "Invest More" : "Invest Now"}
                  </button>
                </div>
              );
            })}
            {plans.length === 0 && <div className="col-span-4 text-center py-16 text-[var(--muted)]">No plans available yet.</div>}
          </div>
        )}

        {/* My investments */}
        {/* <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
          <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)]"><h2 className="font-semibold text-sm">My Investments</h2></div>
          {investments.length === 0 ? (
            <div className="py-14 text-center"><Package size={32} className="text-[var(--muted)] mx-auto mb-3 opacity-40" /><p className="text-[var(--muted)] text-sm">No investments yet.</p></div>
          ) : (
            <>
              <div className="md:hidden divide-y divide-[var(--border)]">
                {investments.map((inv) => {
                  const r = inv.package?.profitPercentage ?? inv.profitPercentage ?? inv.package?.returnRate ?? inv.package?.pct ?? 0;
                  const rt = inv.totalProfit ?? inv.amount * (r / 100);
                  return (
                    <div key={inv._id} className="p-4 space-y-2">
                      <div className="flex justify-between"><span className="font-bold text-[var(--gold)]">{inv.package?.name ?? inv.plan?.name ?? "—"}</span><Badge variant={inv.status === "active" ? "green" : "yellow"}>{inv.status}</Badge></div>
                      {[
                        ["Amount", formatUSD(inv.amount)],
                        ["Interest", `+${formatUSD(rt)}`],
                        ["Total", formatUSD(inv.amount + rt)],
                        ["Duration", inv.package?.duration ? `${inv.package.duration}d` : inv.package?.days ? `${inv.package.days}d` : "—"],
                        ["Start", inv.startDate ? new Date(inv.startDate).toLocaleDateString() : "—"],
                        ["End", inv.endDate ? new Date(inv.endDate).toLocaleDateString() : "—"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm"><span className="text-[var(--muted)]">{k}</span><span className="font-mono">{v}</span></div>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">{["Plan","Status","Amount","Interest","Total","Duration","Start Date","End Date"].map((h)=><th key={h} className="text-left px-6 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">{h}</th>)}</tr></thead>
                  <tbody>
                    {investments.map((inv) => {
                      const r = inv.package?.profitPercentage ?? inv.profitPercentage ?? inv.package?.returnRate ?? inv.package?.pct ?? 0;
                      const rt = inv.totalProfit ?? inv.amount * (r / 100);
                      return (
                        <tr key={inv._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
                          <td className="px-6 py-4 font-bold text-[var(--gold)]">{inv.package?.name ?? inv.plan?.name ?? "—"}</td>
                          <td className="px-6 py-4"><Badge variant={inv.status === "active" ? "green" : inv.status === "pending" ? "yellow" : "muted"}>{inv.status}</Badge></td>
                          <td className="px-6 py-4 font-mono">{formatUSD(inv.amount)}</td>
                          <td className="px-6 py-4 font-mono text-[var(--green)]">+{formatUSD(rt)}</td>
                          <td className="px-6 py-4 font-mono font-bold text-[var(--gold)]">{formatUSD(inv.amount + rt)}</td>
                          <td className="px-6 py-4 text-xs">{inv.package?.duration ? `${inv.package.duration}d` : inv.package?.days ? `${inv.package.days}d` : "—"}</td>
                          <td className="px-6 py-4 text-xs text-[var(--muted)]">{inv.startDate ? new Date(inv.startDate).toLocaleDateString() : "—"}</td>
                          <td className="px-6 py-4 text-xs text-[var(--teal)]">{inv.endDate ? new Date(inv.endDate).toLocaleDateString() : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div> */}
      </div>

      {/* Invest Modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setAmount(""); }} title={`Invest in ${selected?.name}`} subtitle={`Min ${formatUSD(selected ? minAmt(selected) : 0)}`}>
        {selected && (
          <div className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Amount (USD)</label>
              <input type="number" min={minAmt(selected)} placeholder={`Min ${formatUSD(minAmt(selected))}`} value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)] font-mono" />
            </div>
            <div className="flex gap-2">
              {(["BTC","LTC"] as const).map((c) => (
                <button key={c} onClick={() => { setCoin(c); setCopied(false); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${coin===c ? "border-[var(--gold)] bg-[var(--gold-glow)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--muted)]"}`}>
                  {c==="BTC" ? "₿ Bitcoin" : "Ł Litecoin"}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mb-2">Deposit Address ({coin})</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs text-[var(--teal)] break-all flex-1">{DEPOSIT_ADDRESSES[coin]}</p>
                <button onClick={() => copy(DEPOSIT_ADDRESSES[coin])} className="shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
                  {copied ? <CheckCircle size={13} className="text-[var(--green)]"/> : <Copy size={13}/>}
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--gold-glow)] border border-[rgba(212,168,67,0.2)] p-4 text-sm space-y-2">
              {(() => {
                const summaryItems = [["ROI", `${rate(selected)}%`], ["Duration", durationLabel(selected)], ["Your Amount", amount ? formatUSD(Number(amount)) : "—"]];
                if (amount && prices) {
                  const usd = Number(amount);
                  summaryItems.push(["BTC Equivalent", formatCoinPrice(usd / prices.bitcoin.usd) + " ₿"]);
                  summaryItems.push(["LTC Equivalent", formatCoinPrice(usd / prices.litecoin.usd) + " Ł"]);
                }
                return summaryItems.map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-[var(--muted)]">{k}</span><span className="font-semibold text-[var(--gold)]">{v}</span></div>
                ));
              })()}
            </div>
            <div className="flex items-start gap-2 text-xs text-[var(--muted)] p-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)]">
              <Info size={12} className="text-[var(--gold)] shrink-0 mt-0.5"/>
              <span>Send your deposit to the address above after clicking Invest. Your plan activates after payment confirmation (up to 24h).</span>
            </div>
            <button onClick={handleInvest} disabled={sending} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {sending ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Processing…</> : <><CheckCircle size={15}/> Confirm Investment</>}
            </button>
          </div>
        )}
      </Modal>
    </DashLayout>
  );
}
