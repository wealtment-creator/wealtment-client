"use client";
import Link from "next/link";
import { useState } from "react";
import { apiForgotPassword } from "@/lib/api";
import { TrendingUp, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Enter your email."); return; }
    setLoading(true);
    try {
      await apiForgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center p-6 bg-[var(--bg-2)]">
      <div className="w-full max-w-md anim-slide">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-2)] flex items-center justify-center">
            <TrendingUp size={17} className="text-black" />
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-gold-grad">WEALTMENT</span>
        </div>

        {sent ? (
          <div className="glass rounded-2xl p-8 text-center space-y-4">
            <CheckCircle size={40} className="text-[var(--green)] mx-auto" />
            <h2 className="font-display text-2xl font-bold">Check Your Email</h2>
            <p className="text-[var(--muted)] text-sm">Reset link sent to <strong className="text-[var(--text)]">{email}</strong>. Check your inbox (and spam folder).</p>
            <Link href="/login" className="inline-block mt-2 text-[var(--gold)] font-semibold hover:underline text-sm">← Back to login</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold mb-1">Forgot Password?</h1>
            <p className="text-[var(--muted)] text-sm mb-8">Enter your email and we&apos;ll send a reset link.</p>
            <form onSubmit={submit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Email Address</label>
                <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)]" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Sending…</> : "Send Reset Link"}
              </button>
            </form>
            <p className="text-sm text-center text-[var(--muted)] mt-6">
              <Link href="/login" className="text-[var(--gold)] font-semibold hover:underline">← Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
