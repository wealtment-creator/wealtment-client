// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { DashLayout } from "@/components/layout/DashLayout";
// import { CryptoTicker } from "@/components/ui/CryptoTicker";
// import { getUser } from "@/lib/auth";
// import { apiRequestWithdrawal, apiGetMyWithdrawals,apiGetProfile } from "@/lib/api";
// import { COIN_PRICES } from "@/lib/data";
// import { formatUSD } from "@/lib/utils";
// import { ArrowUpFromLine, CheckCircle, AlertCircle, Info } from "lucide-react";
// import toast from "react-hot-toast";
// import type { User, Withdrawal } from "@/types";

// type CoinT = "BTC" | "LTC";
// const META: Record<CoinT, { label: string; color: string; icon: string; fee: number }> = {
//   BTC: { label: "Bitcoin",  color: "#F7931A", icon: "₿", fee: 0.0001 },
//   LTC: { label: "Litecoin", color: "#345D9D", icon: "Ł", fee: 0.001  },
// };

// export default function WithdrawPage() {
//   const router = useRouter();
//   const [user,        setUser]        = useState<User | null>(null);
//   const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
//   const [coin,        setCoin]        = useState<CoinT>("BTC");
//   const [amount,      setAmount]      = useState("");
//   const [loading,     setLoading]     = useState(false);
//   const [submitted,   setSubmitted]   = useState(false);
// console.log('userr', user)
// const toNumber = (val: unknown): number => {
//   const n = Number(val);
//   return isNaN(n) ? 0 : n;
// };
//   useEffect(() => {
//   // const u = getUser();

//   // if (!u) {
//   //   router.replace("/login");
//   //   return;
//   // }



//   apiGetProfile()
//     .then((res) => {
//       const fresh = res.user ?? res;
//       console.log("user", fresh);
//         setUser(fresh);

//     })
//     .catch(() => {});
//   // apiGetMyWithdrawals()
//   //   .then((r) => setWithdrawals(r.withdrawals ?? []))
//   //   .catch(() => {});
// }, [router]);

//   if (!user) return null;
//   const meta    = META[coin];
  

//   setAmount(
//     numericBal > meta.fee
//       ? (numericBal - meta.fee).toFixed(coin === "BTC" ? 6 : 4)
//       : ""
//   );
// };
//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!amount || coinAmt <= 0) { toast.error("Enter a valid amount."); return; }
//     // if (coinAmt <= meta.fee)     { toast.error(`Amount must exceed the ${meta.fee} ${coin} network fee.`); return; }
//     // if (!wallet)                 { toast.error(`Add your ${coin} address in Profile first.`); return; }
//     setLoading(true);
//     try {
//       // POST /withdrawals  { amount, coin }
//             console.log('withdrawal data', 
//               { amount: coinAmt,cointyType: coin=="BTC"?"bitcoin":"litecoin", walletAddress:"btc_test_123" }
            
//             )

// await apiRequestWithdrawal({ amount: coinAmt, coin: coin, coinType: coin=="BTC"?"bitcoin":"litecoin", walletAddress:"btc_test_123" });
//       // const r = await apiGetMyWithdrawals();
//       // setWithdrawals(r.withdrawals ?? []);
//       setSubmitted(true);
//       toast.success("Withdrawal request submitted!");
//     } catch (err: unknown) {
//       toast.error(err instanceof Error ? err.message : "Failed. Try again.");
//     } finally { setLoading(false); }
//   };

//   if (submitted) return (
//     <DashLayout variant="user">
//       <CryptoTicker />
//       <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
//         <div className="glass rounded-2xl p-8 text-center space-y-5">
//           <div className="w-16 h-16 rounded-full bg-[rgba(52,211,153,0.12)] border-2 border-[var(--green)] flex items-center justify-center mx-auto"><CheckCircle size={30} className="text-[var(--green)]"/></div>
//           <h2 className="font-display text-2xl font-bold">Request Submitted!</h2>
//           <p className="text-[var(--muted)] text-sm leading-relaxed">Your withdrawal of <strong className="text-[var(--gold)]">{coinAmt} {coin}</strong> (≈ {formatUSD(usdVal)}) is pending admin approval. Funds arrive within <strong className="text-[var(--teal)]">24 hours</strong>.</p>
//           <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4 text-sm text-left space-y-2">
//             {[["You send", `${coinAmt} ${coin}`], ["Fee", `${meta.fee} ${coin}`], ["You receive", `${netAmt.toFixed(6)} ${coin}`], ["To wallet", wallet ? wallet.slice(0,14)+"…" : "—"]].map(([k,v]) => (
//               <div key={k} className="flex justify-between gap-2"><span className="text-[var(--muted)] shrink-0">{k}</span><span className="font-semibold font-mono text-xs text-right break-all">{v}</span></div>
//             ))}
//           </div>
//           <div className="flex gap-3">
//             <button onClick={() => { setSubmitted(false); setAmount(""); }} className="flex-1 py-3 rounded-xl border border-[var(--border-2)] text-[var(--muted)] text-sm font-bold hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors">New Request</button>
//             <button onClick={() => router.push("/user/dashboard")} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity">Dashboard</button>
//           </div>
//         </div>
//       </div>
//     </DashLayout>
//   );

//   return (
//     <DashLayout variant="user">
//       <CryptoTicker />
//       <div className="p-4 sm:p-6 lg:p-8 max-w-2xl space-y-6">
//         <div>
//           <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3"><ArrowUpFromLine className="text-[var(--teal)]" size={26}/> Withdraw Funds</h1>
//           <p className="text-[var(--muted)] text-sm mt-1">Withdraw to your saved wallet address.</p>
//         </div>

//         {/* Coin + balance selector */}
//         <div className="grid grid-cols-2 gap-3">
//           {(["BTC","LTC"] as CoinT[]).map((c) => {
//            const b = c === "BTC"
//     ? toNumber(user.balance)
//     : toNumber(user.balance);

//   const u = b * COIN_PRICES[c];
//             return (
//               <button key={c} onClick={() => setCoin(c)} className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all w-full ${coin===c ? "border-[var(--gold)] bg-[var(--gold-glow)]" : "border-[var(--border)] bg-[var(--bg-3)] hover:border-[var(--border-2)]"}`}>
//                 <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shrink-0" style={{ background:`${META[c].color}20`, color:META[c].color }}>{META[c].icon}</div>
//                 <div className="min-w-0">
//                   <p className="font-bold text-xs text-[var(--muted)] uppercase tracking-widest">{c}</p>
//                   <p className="font-mono font-bold text-sm truncate">{b.toFixed(c==="BTC"?6:4)}</p>
//                   <p className="text-xs text-[var(--muted)]">≈ {formatUSD(u)}</p>
//                 </div>
//                 {coin===c && <CheckCircle size={14} className="text-[var(--gold)] ml-auto shrink-0"/>}
//               </button>
//             );
//           })}
//         </div>

//         {/* Wallet preview */}
//         {wallet ? (
//           <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4">
//             <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mb-1">Funds will be sent to</p>
//             <p className="font-mono text-xs text-[var(--teal)] break-all">{wallet}</p>
//           </div>
//         ) : (
//           <div className="rounded-xl border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.06)] p-4 text-sm text-[var(--red)] flex items-start gap-2">
//             <AlertCircle size={14} className="shrink-0 mt-0.5"/>
//             <span>No {coin} address saved. <a href="/user/profile" className="underline font-semibold">Add it in your profile.</a></span>
//           </div>
//         )}

//         <form onSubmit={submit} className="glass rounded-2xl p-5 sm:p-6 space-y-5">
//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Amount ({coin})</p>
//               <button type="button" onClick={useMax} className="text-[10px] font-bold text-[var(--gold)] hover:underline">MAX</button>
//             </div>
//             <div className="relative">
//               <input type="number" step="any" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
//                 className="w-full px-4 py-3 pr-16 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)] font-mono" />
//               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--gold)]">{coin}</span>
//             </div>
//             {coinAmt > 0 && <p className="text-xs text-[var(--muted)] mt-1.5">≈ <span className="text-[var(--green)] font-semibold">{formatUSD(usdVal)}</span></p>}
//           </div>

//           {coinAmt > 0 && (
//             <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4 text-sm space-y-2">
//               {[["You send", `${coinAmt} ${coin}`], ["Network fee", `${meta.fee} ${coin}`], ["You receive", `${netAmt.toFixed(6)} ${coin}`], ["USD value", formatUSD(netAmt*price)]].map(([k,v]) => (
//                 <div key={k} className="flex justify-between"><span className="text-[var(--muted)]">{k}</span><span className="font-semibold font-mono text-xs">{v}</span></div>
//               ))}
//             </div>
//           )}

//           <div className="flex items-start gap-2 text-xs text-[var(--muted)] p-3 rounded-lg bg-[var(--gold-glow)] border border-[rgba(212,168,67,0.2)]">
//             <Info size={12} className="text-[var(--gold)] shrink-0 mt-0.5"/>
//             <span>Withdrawals are reviewed and processed within <strong className="text-[var(--gold)]">24 hours</strong>.</span>
//           </div>

//           <button type="submit" disabled={!amount || coinAmt<=0 
//             // !wallet 
            
//             || loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
//             {loading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Submitting…</> : "Submit Withdrawal"}
//           </button>
//         </form>

//         {/* History */}
//         {withdrawals.length > 0 && (
//           <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
//             <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)]"><h2 className="font-semibold text-sm">My Withdrawals</h2></div>
//             <div className="divide-y divide-[var(--border)]">
//               {withdrawals.slice(0,5).map((w) => (
//                 <div key={w._id} className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3 text-sm">
//                   <div><p className="font-mono font-semibold">{w.amount} {w.coin}</p><p className="text-xs text-[var(--muted)]">{new Date(w.createdAt).toLocaleDateString()}</p></div>
//                   <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${w.status==="approved" ? "text-[var(--green)] border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)]" : w.status==="rejected" ? "text-[var(--red)] border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.06)]" : "text-[var(--gold)] border-[rgba(212,168,67,0.3)] bg-[var(--gold-glow)]"}`}>{w.status}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </DashLayout>
//   );
// }


"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import {
  apiRequestWithdrawal,
  apiGetMyWithdrawals,
  apiGetProfile,
} from "@/lib/api";
import { COIN_PRICES } from "@/lib/data";
import { formatUSD } from "@/lib/utils";
import {
  ArrowUpFromLine,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import type { User, Withdrawal } from "@/types";

type CoinT = "BTC" | "LTC";

const META: Record<
  CoinT,
  { label: string; color: string; icon: string; fee: number }
> = {
  BTC: { label: "Bitcoin", color: "#F7931A", icon: "₿", fee: 0.0001 },
  LTC: { label: "Litecoin", color: "#345D9D", icon: "Ł", fee: 0.001 },
};

export default function WithdrawPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [coin, setCoin] = useState<CoinT>("BTC");
  const [amount, setAmount] = useState(""); // USD
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    apiGetProfile()
      .then((res) => {
        const fresh = res.user ?? res;
        setUser(fresh);
      })
      .catch(() => {});

    apiGetMyWithdrawals()
      .then((r) => setWithdrawals(r.withdrawals ?? []))
      .catch(() => {});
  }, []);

  if (!user) return null;

  const meta = META[coin];
  const price = COIN_PRICES[coin];

  // ✅ USD → COIN
  const usdVal = parseFloat(amount) || 0;
  const coinAmt = usdVal / price;

  const netAmt = Math.max(0, coinAmt - meta.fee);

  const wallet =
    coin === "BTC"
      ? user.bitcoinAddress ?? user.bitcoin ?? ""
      : user.litecoinAddress ?? user.litecoin ?? "";

  const bal =
    coin === "BTC"
      ? Number(user.bitcoinBalance ?? 0)
      : Number(user.litecoinBalance ?? 0);

  const useMax = () => {
    const usdBalance = bal * price;
    setAmount(usdBalance.toFixed(2));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || usdVal <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    if (usdVal < 1) {
      toast.error("Minimum withdrawal is $1");
      return;
    }

    if (Number(amount) > user.balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);

    try {
      await apiRequestWithdrawal({
        amount: Number(amount),
        coin: coin,
        coinType: coin === "BTC" ? "bitcoin" : "litecoin",
        walletAddress: wallet || "btc_test_123",
      });

      setSubmitted(true);
      toast.success("Withdrawal request submitted!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted)
    return (
      <DashLayout variant="user">
        <CryptoTicker />
        <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
          <div className="glass rounded-2xl p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[rgba(52,211,153,0.12)] border-2 border-[var(--green)] flex items-center justify-center mx-auto">
              <CheckCircle size={30} className="text-[var(--green)]" />
            </div>

            <h2 className="font-display text-2xl font-bold">
              Request Submitted!
            </h2>

            <p className="text-[var(--muted)] text-sm leading-relaxed">
              Your withdrawal of{" "}
              <strong className="text-[var(--gold)]">
                {coinAmt.toFixed(6)} {coin}
              </strong>{" "}
              (≈ {formatUSD(usdVal)}) is pending approval.
            </p>

            <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span>You send</span>
                <span>{coinAmt.toFixed(6)} {coin}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee</span>
                <span>{meta.fee} {coin}</span>
              </div>
              <div className="flex justify-between">
                <span>You receive</span>
                <span>{netAmt.toFixed(6)} {coin}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setAmount("");
                }}
                className="flex-1 py-3 rounded-xl border border-[var(--border-2)]"
              >
                New Request
              </button>

              <button
                onClick={() => router.push("/user/dashboard")}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </DashLayout>
    );

  return (
    <DashLayout variant="user">
      <CryptoTicker />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <ArrowUpFromLine className="text-[var(--teal)]" size={26} />
            Withdraw Funds
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Withdraw using USD (auto converted to crypto).
          </p>
        </div>

        {/* coin selector */}
        <div className="grid grid-cols-2 gap-3">
          {(["BTC", "LTC"] as CoinT[]).map((c) => {
            const b =
              c === "BTC"
                ? Number(user.bitcoinBalance ?? 0)
                : Number(user.litecoinBalance ?? 0);

            const u = b * COIN_PRICES[c];

            return (
              <button
                key={c}
                onClick={() => setCoin(c)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                  coin === c
                    ? "border-[var(--gold)] bg-[var(--gold-glow)]"
                    : "border-[var(--border)] bg-[var(--bg-3)]"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                  style={{
                    background: `${META[c].color}20`,
                    color: META[c].color,
                  }}
                >
                  {META[c].icon}
                </div>

                <div>
                  <p className="font-bold text-xs">{c}</p>
                  <p className="font-mono text-sm">
                    {/* {b.toFixed(c === "BTC" ? 6 : 4)} */}
                  </p>
                  {/* <p className="text-xs text-[var(--muted)]">
                    ≈ {formatUSD(u)}
                  </p> */}
                </div>
              </button>
            );
          })}
        </div>

        {/* wallet */}
        {wallet ? (
          <div className="rounded-xl bg-[var(--bg-3)] border p-4">
            <p className="text-xs text-[var(--muted)] mb-1">
              Funds will be sent to
            </p>
            <p className="font-mono text-xs text-[var(--teal)] break-all">
              {wallet}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-red-50 p-4 text-sm text-red-500 flex gap-2">
            <AlertCircle size={14} />
            No wallet address set.
          </div>
        )}

        {/* form */}
        <form className="glass rounded-2xl p-5 space-y-5" onSubmit={submit}>
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs">Amount (USD)</p>
              <button type="button" onClick={useMax}>
                MAX
              </button>
            </div>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 text-black rounded-lg"
              placeholder="Min $1"
            />

            {usdVal > 0 && (
              <p className="text-xs mt-1">
                ≈ {coinAmt.toFixed(6)} {coin}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-black py-3 bg-yellow-400 rounded-lg"
          >
            {loading ? "Submitting..." : "Submit Withdrawal"}
          </button>
        </form>
      </div>
    </DashLayout>
  );
}