"use client";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiResetPassword } from "@/lib/api";
import { TrendingUp, CheckCircle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

function ResetForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const token   = params.get("token") ?? "";
  const [pw,     setPw]     = useState("");
  const [conf,   setConf]   = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading,setLoading]= useState(false);
  const [done,   setDone]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== conf) { toast.error("Passwords do not match."); return; }
    if (pw.length < 6) { toast.error("Minimum 6 characters."); return; }
    if (!token) { toast.error("Invalid reset link."); return; }
    setLoading(true);
    try {
      await apiResetPassword(token, pw);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Reset failed.");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="glass rounded-2xl p-8 text-center space-y-4">
      <CheckCircle size={40} className="text-[var(--green)] mx-auto" />
      <h2 className="font-display text-2xl font-bold">Password Reset!</h2>
      <p className="text-[var(--muted)] text-sm">Redirecting you to login…</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <h1 className="font-display text-3xl font-bold mb-1">Reset Password</h1>
      <p className="text-[var(--muted)] text-sm mb-6">Enter your new password below.</p>
      {[{ label:"New Password", val:pw, set:setPw }, { label:"Confirm Password", val:conf, set:setConf }].map(({ label, val, set }) => (
        <div key={label} className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">{label}</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} required placeholder="••••••••" value={val} onChange={(e) => set(e.target.value)}
              className="w-full px-4 py-3 pr-11 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--muted)]" />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--gold)]">
              {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
        </div>
      ))}
      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Resetting…</> : "Reset Password"}
      </button>
      <p className="text-sm text-center text-[var(--muted)]">
        <Link href="/login" className="text-[var(--gold)] font-semibold hover:underline">← Back to login</Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center p-6 bg-[var(--bg-2)]">
      <div className="w-full max-w-md anim-slide">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-2)] flex items-center justify-center">
            <TrendingUp size={17} className="text-black" />
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-gold-grad">WEALTMENT</span>
        </div>
        <Suspense fallback={<p className="text-[var(--muted)] text-sm">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
