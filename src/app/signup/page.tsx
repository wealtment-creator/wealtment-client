"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CRYPTO_IMAGES } from "@/lib/data";
import { setUser } from "@/lib/auth";
import { apiSignup } from "@/lib/api";
import { TrendingUp, Eye, EyeOff, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { User } from "@/types";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    bitcoinAddress: "",
    litecoinAddress: "",
    referralCode: "",   // ← key must match exactly
  });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const router = useRouter();

  // Generic field setter — always reads from form state, never undefined
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match."); return; }
    if (form.password.length < 6)       { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const data = await apiSignup({
        name:            form.name,
        email:           form.email,
        password:        form.password,
        bitcoinAddress:  form.bitcoinAddress  || undefined,
        litecoinAddress: form.litecoinAddress || undefined,
          referral: form.referralCode || undefined, 
 // optional — only sent if filled
      });

      if (data.token && data.user) {
        const user: User = {
          _id:             data.user._id,
          name:            data.user.name,
          email:           data.user.email,
          token:           data.token,
          role:            data.user.role ?? "user",
          isAdmin:         data.user.role === "admin",
          bitcoinAddress:  data.user.bitcoinAddress  ?? "",
          litecoinAddress: data.user.litecoinAddress ?? "",
          bitcoin:         data.user.bitcoinAddress  ?? "",
          litecoin:        data.user.litecoinAddress ?? "",
          balance: 0, btcBalance: 0, ltcBalance: 0, package: null,
        };
        setUser(user);
        toast.success("Account created!");
        router.push("/user/dashboard");
      } else {
        setDone(true);
        toast.success("Account created! Check your email to verify.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    } finally { setLoading(false); }
  };

  // ── Email verify screen ───────────────────────────────────────────────────
  if (done) return (
    <div className="min-h-screen pt-16 flex items-center justify-center p-6 bg-[var(--bg-2)]">
      <div className="glass rounded-2xl p-10 max-w-md w-full text-center space-y-4">
        <CheckCircle size={48} className="text-[var(--green)] mx-auto" />
        <h2 className="font-display text-2xl font-bold">Check your email</h2>
        <p className="text-[var(--muted)] text-sm leading-relaxed">
          We sent a verification link to{" "}
          <strong className="text-[var(--text)]">{form.email}</strong>.<br />
          Click the link to activate your account then log in.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );

  // ── Main sign-up form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-16 flex">
      {/* Hero image — desktop only */}
      <div className="hidden lg:block flex-1 relative">
        <Image src={CRYPTO_IMAGES.goldBitcoin} alt="Bitcoin" fill className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--bg-2)]" />
        <div className="absolute bottom-12 left-12">
          <p className="font-display text-3xl font-bold text-gold-grad mb-2">Start Investing Today</p>
          <p className="text-[var(--muted-2)] max-w-xs">Join investors earning daily returns with Wealtment.</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[var(--bg-2)] overflow-y-auto">
        <div className="w-full max-w-md py-8 anim-slide">

          {/* Brand */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-2)] flex items-center justify-center">
              <TrendingUp size={17} className="text-black" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-gold-grad">WEALTMENT</span>
          </div>

          <h1 className="font-display text-3xl font-bold mb-1">Create Account</h1>
          <p className="text-[var(--muted)] text-sm mb-6">Open your free investment account in minutes.</p>

          <form onSubmit={submit} className="space-y-4">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Full Name *</label>
              <input
                type="text" placeholder="John Doe" required
                value={form.name} onChange={set("name")}
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Email *</label>
              <input
                type="email" placeholder="you@example.com" required
                value={form.email} onChange={set("email")}
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)]"
              />
            </div>

            {/* Referral code — optional, no "required" */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">
                Referral Code <span className="normal-case font-normal text-[var(--muted)]">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Enter referral code if you have one"
                value={form.referralCode}          // ← FIXED: was form["referral"] = undefined
                onChange={set("referralCode")}     // ← FIXED: key matches form state
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)]"
              />
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-3">
              {(["password", "confirm"] as const).map((key) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">
                    {key === "password" ? "Password *" : "Confirm *"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={form[key]}
                      onChange={set(key)}
                      className="w-full px-4 py-3 pr-10 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)]"
                    />
                    {key === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--gold)]"
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Wallet addresses — both optional */}
            {([
              { label: "Bitcoin Address",  key: "bitcoinAddress",  ph: "bc1q… (optional)" },
              { label: "Litecoin Address", key: "litecoinAddress", ph: "ltc1q… (optional)" },
            ] as { label: string; key: keyof typeof form; ph: string }[]).map(({ label, key, ph }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">{label}</label>
                <input
                  type="text" placeholder={ph}
                  value={form[key]}
                  onChange={set(key)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)]"
                />
              </div>
            ))}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 !mt-6"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating account…
                </>
              ) : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-center text-[var(--muted)] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--gold)] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
