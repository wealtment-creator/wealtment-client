"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DashLayout } from "@/components/layout/DashLayout";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { getUser } from "@/lib/auth";
import { apiGetMyInvestments, apiGetBalance, apiGetCryptoPrices } from "@/lib/api";
import { COINS_INIT, CRYPTO_IMAGES, COIN_PRICES } from "@/lib/data";
import { formatUSD, formatCoinPrice, getNextPaymentDate } from "@/lib/utils";
import { Wallet, TrendingUp, Calendar, Package, ArrowUpRight, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import type { User, Investment, Coin } from "@/types";

export default function UserDashboardPage() {
  const router = useRouter();
  const [user,        setUser]        = useState<User | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [coins,       setCoins]       = useState<Coin[]>(COINS_INIT);
  const [btcPrice,    setBtcPrice]    = useState(COIN_PRICES.BTC);
  const [ltcPrice,    setLtcPrice]    = useState(COIN_PRICES.LTC);
  const [loading,     setLoading]     = useState(true);
  // const [balance,     setBalance]     = useState<number>(0);
  const [balance, setBalance] = useState(0);
const [btcBal, setBtcBal] = useState(0);
const [ltcBal, setLtcBal] = useState(0);
  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
    
    // Fetch investments
    apiGetMyInvestments()
      .then((res) => {
        console.log('investments response', res);
        setInvestments(Array.isArray(res) ? res : res.investments ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    // Fetch balance
   apiGetBalance()
  .then((res) => {
    console.log('res-balance', res);

    setBtcBal(res.btcBalance ?? 0);
    setLtcBal(res.ltcBalance ?? 0);

    // total = btc + ltc (clean)
    setBalance((res.btcBalance ?? 0) + (res.ltcBalance ?? 0));
  })
  }, []);

  useEffect(() => {
    // Fetch crypto prices
    apiGetCryptoPrices()
      .then((prices) => {
        const btc = prices.bitcoin?.usd ?? 0;
        const ltc = prices.litecoin?.usd ?? 0;

        if (btc > 0) {
          setBtcPrice(btc);
        }
        if (ltc > 0) {
          setLtcPrice(ltc);
        }

        setCoins((prev) =>
          prev.map((c) => {
            if (c.sym === "BTC") return { ...c, price: btc > 0 ? btc : c.price };
            if (c.sym === "LTC") return { ...c, price: ltc > 0 ? ltc : c.price };
            return c;
          })
        );
      })
      .catch(() => {});
  }, []);

  // Simulated live prices for non-BTC/LTC coins
  useEffect(() => {
    const iv = setInterval(() => {
      setCoins((p) => p.map((c) => {
        if (c.sym === "BTC" || c.sym === "LTC") return c;
        return {
          ...c,
          price: c.price * (1 + (Math.random() - 0.5) * 0.003),
          chg: c.chg + (Math.random() - 0.5) * 0.05,
        };
      }));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  // balance is now USD
const portfolioBalance = balance;

  if (!user) return null;

  const activeInv  = investments.find((i) => i.status === "active" || i.status === "pending");
  const plan       = activeInv?.package;
  const principal  = activeInv?.amount ?? 0;
  const rate       = plan?.profitPercentage ?? 0;
  const interest   = principal * (rate / 100);
  // const nextDate   = plan ? getNextPaymentDate(plan.duration) : null;
  // const nextDate =
  // activeInv?.startDate && plan?.duration
  //   ? getNextPaymentDate(activeInv.startDate, Number(plan.duration))
  //   : null;
    const nextDate = activeInv?.endDate
  ? new Date(activeInv.endDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  : null;
  return (
    <DashLayout variant="user">
      <CryptoTicker />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-[var(--muted)] text-sm mt-0.5">Welcome back, <span className="text-[var(--gold)] font-semibold">{user.name}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/user/deposit"  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--gold)]  text-[var(--gold)]  text-xs font-bold hover:bg-[var(--gold-glow)] transition-colors"><ArrowDownToLine size={13}/> Deposit</Link>
            <Link href="/user/withdraw" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--teal)]  text-[var(--teal)]  text-xs font-bold hover:bg-[var(--teal-glow)] transition-colors"><ArrowUpFromLine size={13}/> Withdraw</Link>
            <Link href="/user/packages" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black text-xs font-bold hover:opacity-90 transition-opacity"><Package size={13}/> Invest</Link>
          </div>
        </div>

        {/* Portfolio overview */}
        <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg-3)]">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src={CRYPTO_IMAGES.bitcoin} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-2)] to-transparent" />
          </div>
          <div className="relative p-5 sm:p-7">
            <p className="text-[10px] font-bold tracking-[3px] uppercase text-[var(--muted)] mb-1">Total Portfolio</p>
            <p className="font-display text-4xl sm:text-5xl font-black text-gold-grad">{formatUSD(portfolioBalance)}</p>
            {plan && nextDate && (
              <p className="text-xs text-[var(--muted)] mt-2">Plan: <span className="text-[var(--gold)] font-semibold">{plan.name}</span> · Next payout: <span className="text-[var(--teal)] font-semibold">{nextDate}</span></p>
            )}

            {/* BTC + LTC cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-[var(--border)]">
              {/* BTC */}
              <div className="flex items-center gap-3 bg-[rgba(247,147,26,0.06)] border border-[rgba(247,147,26,0.15)] rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(247,147,26,0.15)] flex items-center justify-center shrink-0 text-xl font-bold text-[#F7931A]">₿</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Bitcoin Balance</p>
                <p className="font-mono font-bold text-base mt-0.5">
${btcBal.toFixed(2)}

</p>
<p className="text-xs text-[var(--muted)]">
  ≈ {(btcBal / btcPrice).toFixed(6)} BTC<span className="text-[#F7931A]">BTC</span>
</p>
                </div>
              </div>
              {/* LTC */}
              <div className="flex items-center gap-3 bg-[rgba(52,93,157,0.06)] border border-[rgba(52,93,157,0.2)] rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(52,93,157,0.15)] flex items-center justify-center shrink-0 text-xl font-bold text-[var(--teal)]">Ł</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Litecoin Balance</p>
                 <p className="font-mono font-bold text-base mt-0.5">
  ${ltcBal.toFixed(2)}

LTC
</p>
<p className="text-xs text-[var(--muted)]">
≈ {(ltcBal / ltcPrice).toFixed(4)}  <span className="text-[var(--teal)]">LTC</span>
</p>
                </div>
              </div>
            </div>

            {/* Investment balance */}
            {balance > 0 && (
              <div className="mt-3 overflow-x-scroll  flex items-center gap-3 bg-[var(--gold-glow)] border border-[rgba(212,168,67,0.2)] rounded-xl p-4 md:overflow-x-hidden">
                <div className="w-10 h-10 rounded-full bg-[var(--gold-glow)] flex items-center justify-center shrink-0"><TrendingUp size={18} className="text-[var(--gold)]"/></div>
                <div className="flex-1"><p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Total Balance</p><p className="font-mono font-bold text-base text-[var(--gold)] mt-0.5">{formatUSD(portfolioBalance)}</p></div>
                <div className="text-right shrink-0"><p className="text-[10px] text-[var(--muted)] uppercase">BTC</p><p className="font-mono font-bold text-sm text-[var(--green)]">{(btcBal / btcPrice).toFixed(6)} BTC</p></div>
                <div className="text-right shrink-0"><p className="text-[10px] text-[var(--muted)] uppercase">LTC</p><p className="font-mono font-bold text-sm text-[var(--teal)]">{(ltcBal / ltcPrice).toFixed(4)} LTC</p></div>
              </div>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Inv. Balance" value={formatUSD(principal)}        icon={<Wallet size={16}/>}       accent="var(--gold)" />
          <StatCard label="Interest"     value={`+${formatUSD(interest)}`}   icon={<TrendingUp size={16}/>}   accent="var(--green)" />
          <StatCard label="Total Return" value={formatUSD(principal+interest)}icon={<ArrowUpRight size={16}/>} accent="var(--teal)" />
          <StatCard label="Active Plan"  value={plan?.name ?? "None"}         icon={<Package size={16}/>}      accent={plan ? "var(--gold)" : "var(--muted)"} sub={plan ? `${rate}% in ${plan.duration} hour (s)` : "No active plan"} />
        </div>

        {/* Next payment */}
        {plan && nextDate && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl border border-[rgba(212,168,67,0.25)] bg-[var(--gold-glow)] text-sm">
            <Calendar size={14} className="text-[var(--gold)] shrink-0" />
            <span className="text-[var(--muted)]">Next payout of</span>
            <strong className="text-[var(--green)]">{formatUSD(interest)}</strong>
            <span className="text-[var(--muted)]">on</span>
            <strong className="text-[var(--gold)]">{nextDate}</strong>
          </div>
        )}

        {/* Investments table */}
        <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
          <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-sm">My Investments</h2>
            {!investments.length && !loading && (
              <Link href="/user/packages" className="text-xs text-[var(--gold)] font-semibold hover:underline">Invest now →</Link>
            )}
          </div>
          {loading ? (
            <div className="py-12 text-center text-[var(--muted)] text-sm animate-pulse">Loading…</div>
          ) : investments.length === 0 ? (
            <div className="py-14 text-center">
              <Package size={32} className="text-[var(--muted)] mx-auto mb-3 opacity-40" />
              <p className="text-[var(--muted)] text-sm">No investments yet.</p>
              <Link href="/user/packages" className="text-[var(--gold)] text-sm font-semibold mt-1 inline-block hover:underline">Browse plans →</Link>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[var(--border)]">
                {investments.map((inv) => {
                  const r = inv.package?.profitPercentage ?? 0;
                  const rt = inv.totalProfit ?? (inv.amount * (r / 100));
                  return (
                    <div key={inv._id} className="p-4 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[var(--gold)]">{inv.package?.name ?? "—"}</span>
                        <Badge variant={inv.status === "active" ? "green" : inv.status === "pending" ? "yellow" : "muted"}>{inv.status}</Badge>
                      </div>
                      {[["Principal", formatUSD(inv.amount)], ["Interest", `+${formatUSD(rt)}`], ["Total", formatUSD(inv.amount + rt)], ["Duration", inv.package?.duration ? `${inv.package.duration} hour (s)` : "—"], ["Start", inv.startDate ? new Date(inv.startDate).toLocaleDateString() : "—"], ["End", inv.endDate ? new Date(inv.endDate).toLocaleDateString() : "—"]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm"><span className="text-[var(--muted)]">{k}</span><span className="font-mono font-semibold">{v}</span></div>
                      ))}
                    </div>
                  );
                })}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">{["Plan","Status","Principal","Interest","Total Return","Duration",
                    // "Start Date","End Date"
                  ].map((h) => <th key={h} className="text-left px-6 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody>
                    {investments.map((inv) => {
                      const r = inv.package?.profitPercentage ?? 0;
                      const rt = inv.totalProfit ?? (inv.amount * (r / 100));
                      return (
                        <tr key={inv._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
                          <td className="px-6 py-4 font-bold text-[var(--gold)]">{inv.package?.name ?? "—"}</td>
                          <td className="px-6 py-4"><Badge
                          
variant={
  inv.status === "active"
    ? "green"
    : inv.status === "pending"
    ? "yellow"
    : inv.status === "completed"
    ? "blue"   
    : "muted"
}                          
                          >{inv.status}</Badge></td>
                          <td className="px-6 py-4 font-mono">{formatUSD(inv.amount)}</td>
                          <td className="px-6 py-4 font-mono text-[var(--green)]">+{formatUSD(rt)}</td>
                          <td className="px-6 py-4 font-mono font-bold text-[var(--gold)]">{formatUSD(inv.amount + rt)}</td>
                          <td className="px-6 py-4 text-xs">{inv.package?.duration ? `${inv.package.duration} hours (s)` : "—"}</td>
                          {/* <td className="px-6 py-4 text-xs text-[var(--muted)]">{inv.startDate ? new Date(inv.startDate).toLocaleDateString() : "—"}</td>
                          <td className="px-6 py-4 text-xs text-[var(--teal)]">{inv.endDate ? new Date(inv.endDate).toLocaleDateString() : "—"}</td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Live prices */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mb-3">Live Prices</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {coins.map((c) => (
              <div key={c.sym} className="glass rounded-xl p-3 sm:p-4 hover:border-[var(--gold)] transition-colors">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mb-1">{c.sym}</p>
                <p className="font-mono font-bold text-sm sm:text-base">${formatCoinPrice(c.price)}</p>
                <p className={`text-xs font-semibold mt-1 ${c.chg >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                  {c.chg >= 0 ? "▲" : "▼"} {Math.abs(c.chg).toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashLayout>
  );
}
