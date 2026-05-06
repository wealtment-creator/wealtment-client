"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CRYPTO_IMAGES } from "@/lib/data";
import { setUser } from "@/lib/auth";
import { apiLogin } from "@/lib/api";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import type { User } from "@/types";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    try {
      // POST /auth/login  → { token, user }
      const apiUser  = await apiLogin({ email, password });
      console.log('apilogin',apiUser)
      const token   = apiUser.token

      const user: User = {
        _id:             apiUser._id,
        name:            apiUser.name,
        email:           apiUser.email,
        token,
        role:            apiUser.role ?? "user",
        isAdmin:         apiUser.role === "admin",
        bitcoinAddress:  apiUser.bitcoinAddress ?? "",
        litecoinAddress: apiUser.litecoinAddress ?? "",
        bitcoin:         apiUser.bitcoinAddress  ?? "",
        litecoin:        apiUser.litecoinAddress ?? "",
        balance:         0,
        referralCode:    apiUser.referralCode ?? "",
        btcBalance:      0,
        ltcBalance:      0,
        package:         null,
      };

      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(user.isAdmin ? "/admin" : "/user/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials.");
      console.log('err', err);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-16 flex">
      <div className="hidden lg:block flex-1 relative">
                <Image src={CRYPTO_IMAGES.goldBitcoin} alt="Bitcoin" fill className="object-cover opacity-50" />
        
        {/* <Image src={CRYPTO_IMAGES.crypto3d} alt="Crypto" fill className="object-cover opacity-60" /> */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--bg)]" />
        <div className="absolute bottom-12 left-12">
          <p className="font-display text-3xl font-bold text-gold-grad mb-2">Wealtment Limited</p>
          <p className="text-[var(--muted-2)]">Professional Forex & Crypto Trading</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[var(--bg-2)]">
        <div className="w-full max-w-md anim-slide">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-2)] flex items-center justify-center">
              <TrendingUp size={17} className="text-black" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-gold-grad">WEALTMENT</span>
          </div>

          <h1 className="font-display text-3xl font-bold mb-1">Welcome back</h1>
          <p className="text-[var(--muted)] text-sm mb-8">Sign in to your investment account.</p>

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Email</label>
              <input
                type="email" autoComplete="email" required
                placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} autoComplete="current-password" required
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)]"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-[var(--gold)] hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Signing in…</>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-center text-[var(--muted)] mt-6">
            No account? <Link href="/signup" className="text-[var(--gold)] font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
