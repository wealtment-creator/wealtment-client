
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { getUser } from "@/lib/auth";
import { apiCreateDeposit, apiGetMyDeposits } from "@/lib/api";
import { DEPOSIT_ADDRESSES, COIN_PRICES } from "@/lib/data";
import { formatUSD } from "@/lib/utils";
import { CheckCircle, AlertCircle, ArrowDownToLine, Copy, Info } from "lucide-react";
import toast from "react-hot-toast";
import type { User, Deposit } from "@/types";

type CoinT = "bitcoin" | "litecoin";

const META: Record<CoinT, { label: string; color: string; icon: string; conf: number }> = {
  bitcoin: { label: "Bitcoin", color: "#F7931A", icon: "₿", conf: 3 },
  litecoin: { label: "Litecoin", color: "#345D9D", icon: "Ł", conf: 6 },
};

export default function DepositPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [coin, setCoin] = useState<CoinT>("bitcoin");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Function to fetch data - defined outside useEffect for reuse
  const fetchDeposits = async () => {
    try {
      const res = await apiGetMyDeposits();
      console.log("API RESPONSE:", res);
      
      // FIX 1: If res is already the array (as seen in your console), 
      // do not look for res.deposit. Use res directly.
      setDeposits(Array.isArray(res) ? res : res?.deposits || []);
    } catch (err) {
      console.error("GET deposits error:", err);
    }
  };

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
    fetchDeposits();
  }, [router]);

  if (!user) return null;

  const meta = META[coin];
  const price = COIN_PRICES[coin];
  const addr = DEPOSIT_ADDRESSES[coin];

  const usdVal = parseFloat(amount) || 0;
  const minUsd = 1;
  const coinAmt = usdVal > 0 ? usdVal / price : 0;

  const copy = () => {
    navigator.clipboard.writeText(addr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success("Address copied!");
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usdVal || usdVal < minUsd) {
      toast.error("Minimum deposit is $1");
      return;
    }

    setLoading(true);
    try {
      await apiCreateDeposit({
        amount, 
        coinType: coin,
      });

      setSubmitted(true);
      toast.success("Deposit submitted!");
      fetchDeposits(); // Refresh list after new deposit
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed. Try again.");
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
            <h2 className="font-display text-2xl font-bold">Deposit Submitted!</h2>
            <p className="text-[var(--muted)] text-sm">
              You deposited <strong className="text-[var(--gold)]">{formatUSD(usdVal)}</strong> ≈{" "}
              <strong className="text-[var(--teal)]">{coinAmt.toFixed(8)} {coin}</strong>
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setSubmitted(false); setAmount(""); }} className="flex-1 py-3 rounded-xl border">New Deposit</button>
              <button onClick={() => router.push("/user/dashboard")} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold">Dashboard</button>
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
          <h1 className="font-display text-2xl font-bold flex items-center gap-3">
            <ArrowDownToLine className="text-[var(--gold)]" size={26} />
            Deposit Funds
          </h1>
          <p className="text-[var(--muted)] text-sm">Enter USD and we convert to crypto</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          {/* Coin selector */}
          <div>
            <p className="text-[10px] uppercase text-[var(--muted)] mb-3">Select Coin</p>
            <div className="grid grid-cols-2 gap-3">
              {(["bitcoin", "litecoin"] as CoinT[]).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCoin(c); setCopied(false); }}
                  className={`p-4 rounded-xl border ${coin === c ? "border-[var(--gold)] bg-[var(--gold-glow)]" : "border-[var(--border)]"}`}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold mb-2 mx-auto" style={{ background: `${META[c].color}20`, color: META[c].color }}>
                    {META[c].icon}
                  </div>
                  <p className="font-bold text-sm text-center">{META[c].label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Address Display */}
          <div>
            <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)] mb-2">{meta.label} Deposit Address</p>
            <div className="rounded-xl bg-[var(--bg-3)] border border-[var(--border)] p-4">
              <p className="font-mono text-xs sm:text-sm text-[var(--teal)] break-all leading-relaxed mb-3">{addr}</p>
              <button onClick={copy} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${copied ? "border-[var(--green)] text-[var(--green)] bg-[rgba(52,211,153,0.08)]" : "border-[var(--border-2)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"}`}>
                {copied ? <><CheckCircle size={13}/> Copied!</> : <><Copy size={13}/> Copy Address</>}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-xl border border-[rgba(212,168,67,0.2)] bg-[var(--gold-glow)] p-4">
            <p className="text-xs font-bold text-[var(--gold)] flex items-center gap-2 mb-2"><Info size={13}/> How to deposit</p>
            <ol className="text-xs text-[var(--muted)] space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Enter the amount of <strong className="text-[var(--text)]">{coin}</strong> you want to deposit.</li>
              <li>Copy the address above and send from your wallet.</li>
              <li>Click <strong className="text-[var(--gold)]">"Submit Deposit"</strong> to notify our team.</li>
              <li>Account credited after <strong className="text-[var(--teal)]">{meta.conf} network confirmations</strong>.</li>
            </ol>
          </div>
          
          <form onSubmit={submit} className="space-y-4">
            <div>
              <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)] mb-2">Amount in USD</p>
              <div className="relative">
                <input 
                  type="number" 
                  step="any" 
                  placeholder="Enter amount in USD (min $1)"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 pr-16 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)] font-mono" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--gold)]">USD</span>
              </div>
              {usdVal > 0 && (
                <p className="text-xs text-[var(--muted)] mt-2">
                  ≈ <span className="text-[var(--green)] font-semibold">{coinAmt.toFixed(8)} {coin}</span>
                </p>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs text-[var(--muted)] p-3 rounded-lg bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.2)]">
              <AlertCircle size={12} className="text-[var(--red)] shrink-0 mt-0.5"/>
              <span>Only send <strong className="text-[var(--red)]">{coin}</strong> to this address. Other coins will be lost.</span>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? "Submitting..." : <><CheckCircle size={16}/> Submit Deposit</>}
            </button>
          </form>
        </div>

        {/* History Section - FIXED MAPPING */}
        {deposits.length > 0 && (
          <div className="glass rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="p-4 font-semibold border-b border-[var(--border)] bg-[rgba(255,255,255,0.02)]">My Recent Deposits</div>
            <div className="divide-y divide-[var(--border)]">
              {deposits.slice(0, 5).map((d) => (
                <div key={d._id} className="flex justify-between items-center p-4 text-sm hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div className="space-y-1">
                    <p className="font-mono font-bold text-[var(--text)]">
                      {d.amount} <span className="text-[var(--gold)] uppercase">$</span>
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      d.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashLayout>
  );
}