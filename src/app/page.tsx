'use client'

import Image from "next/image";
import Link from "next/link";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { SectionTag } from "@/components/ui/SectionTag";
import {  DEPOSITS, WITHDRAWALS, CRYPTO_IMAGES} from "@/lib/data";
import { formatUSD } from "@/lib/utils";
import {
  Shield, Zap, Server, Lock, Clock, TrendingUp,
  ArrowRight,

} from "lucide-react";
import Package from '../app/plans/components/Package';
import {  useAutoScroll } from "@/hooks/useAutoScroll";
const FEATURES = [
  { 
  icon: <Clock size={20} />, 
  title: "24/7 Support", 
  text: "Chat with our experts anytime, or reach out via our contact form." 
},
  { icon: <Server size={20} />, title: "Dedicated Server", text: "Enterprise DDoS protection keeps your funds and data safe at all times." },
  { icon: <Lock size={20} />, title: "256-bit SSL", text: "Extended Validation certificate from Comodo verifies our authenticity." },
  { icon: <Shield size={20} />, title: "UK Registered", text: "Legally registered in England & Wales as Wealtment Limited." },
  { icon: <Zap size={20} />, title: "Instant Withdrawals", text: "Withdrawals processed immediately — minimum $10, no waiting." },
  { icon: <TrendingUp size={20} />, title: "Algo Trading", text: "Advanced bots trade 24/7 on Forex & crypto markets for maximum yield." },
];

const STEPS = [
  { n: "01", title: "Create Account", text: "Sign up with your email, name and crypto wallet addresses in minutes." },
  { n: "02", title: "Choose a Plan", text: "Pick the investment package that matches your budget and goals." },
  { n: "03", title: "Make a Deposit", text: "Send BTC or LTC to the provided address to activate your plan." },
  { n: "04", title: "Earn & Withdraw", text: "Watch earnings grow and withdraw instantly to your wallet." },
];


export default function HomePage() {



  return (
    <>
      <CryptoTicker />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center pt-16 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[var(--bg)] grid-pattern" />
        <div className="absolute inset-0 bg-gradient-radial from-[rgba(212,168,67,0.07)] via-transparent to-transparent" style={{ backgroundPosition: "60% 40%" }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[var(--teal-glow)] blur-[120px] opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="anim-slide">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[2px] uppercase text-[var(--gold)] mb-6 px-3 py-1.5 rounded-full border border-[var(--gold-glow)] bg-[var(--gold-glow)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
              Live Trading Active — UK Registered
            </div>

            <h1 className="font-display text-5xl xl:text-6xl font-black leading-[1.08] mb-6 text-[var(--text)]">
              Grow Your Capital
              <br />
              <span className="text-gold-grad">With Wealtment</span>
            </h1>

            <p className="text-[var(--muted-2)] text-lg leading-relaxed mb-8 max-w-lg">
              Professional Forex & crypto trading delivering 20–200% returns. Algorithmic systems, instant withdrawals, fully UK-registered.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg shadow-[var(--gold-glow)]">
                Open Account <ArrowRight size={16} />
              </Link>
              <Link href="/plans" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[var(--border-2)] text-[var(--muted-2)] font-semibold text-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors">
                View Plans
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-5 mt-10 pt-8 border-t border-[var(--border)]">
              {[
                { label: "Total Accounts", val: "453K+" },
                { label: "Total Deposited", val: "$3.02T+" },
                { label: "Withdrawals", val: "$802B+" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-xl font-bold text-gold-grad">{s.val}</p>
                  <p className="text-[10px] tracking-widest uppercase text-[var(--muted)]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – hero image + floating cards */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl">
              <Image
                src={CRYPTO_IMAGES.hero}
                alt="Crypto trading dashboard"
                width={600}
                height={440}
                className="object-cover w-full h-[440px]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
            </div>
            {/* Floating cards */}
            <div className="animate-float absolute -bottom-5 -left-6 glass rounded-xl p-4 shadow-xl">
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1">BTC / USD</p>
              <p className="font-mono font-bold text-lg text-[var(--green)]">$83,241.55</p>
            </div>
            <div className="animate-float absolute -top-5 -right-6 glass rounded-xl p-4 shadow-xl" style={{ animationDelay: "2s" }}>
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1">Portfolio ROI</p>
              <p className="font-mono font-bold text-lg text-[var(--gold)]">+127.4%</p>
            </div>
          </div>
        </div>
      </section>

  {/* ── PLANS ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionTag>Investment Plans</SectionTag>
            <h2 className="font-display text-4xl font-bold mt-2">
              Choose Your <span className="text-gold-grad">Growth Plan</span>
            </h2>
            <p className="text-[var(--muted-2)] mt-3 max-w-lg mx-auto">
              All plans include instant withdrawals, principal return, and unlimited deposits.
            </p>
          </div>
<Package show={false}/>
          {/* <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {PACKAGES.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-2xl p-6 flex flex-col transition-all hover:-translate-y-2 hover:shadow-2xl ${
                  p.featured
                    ? "border-[var(--gold)] bg-gradient-to-b from-[rgba(212,168,67,0.08)] to-[var(--bg-card)] border shadow-[0_0_40px_var(--gold-glow)]"
                    : "glass hover:border-[var(--gold)]"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black">
                    Most Popular
                  </span>
                )}
                <p className="text-[10px] font-bold tracking-[2px] uppercase text-[var(--muted)] mb-4">{p.name} PACKAGE</p>
                <p className="font-display text-5xl font-black text-[var(--gold)]">{p.pct}%</p>
                <p className="text-xs text-[var(--muted)] mt-1 mb-1">Return on Investment</p>
                <p className="text-sm font-semibold text-[var(--teal)] mb-6">After {p.days} days</p>

                <div className="border-t border-[var(--border)] pt-4 space-y-2.5 flex-1">
                  {[
                    ["Min Deposit", formatUSD(p.min)],
                    ["Max Deposit", p.max ? formatUSD(p.max) : "Unlimited"],
                    ["Withdrawals", "Instant"],
                    ["Principal", "Returned ✓"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-[var(--muted)]">{k}</span>
                      <span className="font-semibold text-[var(--text)]">{v}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup" className="mt-6 block text-center py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity">
                  Get Started
                </Link>
              </div>
            ))}
          </div> */}
        </div>
      </section>
      {/* ── COIN IMAGES STRIP ─────────────────────────────────────── */}
      <section className="border-y border-[var(--border)] overflow-hidden">
        <div className="grid grid-cols-3 h-52">
          {[CRYPTO_IMAGES.bitcoin, CRYPTO_IMAGES.ethereum, CRYPTO_IMAGES.coins].map((src, i) => (
            <div key={i} className="relative overflow-hidden">
              <Image src={src} alt="crypto" fill className="object-cover opacity-70 hover:opacity-100 transition-opacity hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-transparent to-[var(--bg)]" />
            </div>
          ))}
        </div>
      </section>

    

      {/* ── BITCOIN IMAGE BANNER ──────────────────────────────────── */}
      <section className="relative h-72 overflow-hidden border-y border-[var(--border)]">
        <Image src={CRYPTO_IMAGES.btcGold} alt="Bitcoin Gold" fill className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-transparent to-[var(--bg)]" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h2 className="font-display text-4xl font-black text-gold-grad mb-4">17th February 2021 </h2>
            <p className="text-lg text-gray-200">Founded &amp; Trading Every Day Since</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionTag>Process</SectionTag>
            <h2 className="font-display text-4xl font-bold mt-2">How It <span className="text-teal-grad">Works</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="glass rounded-2xl p-6 hover:border-[var(--gold)] transition-colors">
                <p className="font-display text-5xl font-black text-gold-grad opacity-40 mb-4">{s.n}</p>
                <h3 className="font-semibold text-2xl mb-2">{s.title}</h3>
                <p className="text-lg text-gray-200 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-[var(--bg-2)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-14">
            <div>
              <SectionTag>Features</SectionTag>
              <h2 className="font-display text-4xl font-bold mt-2">Why <span className="text-gold-grad">Wealtment?</span></h2>
              <p className="text-lg text-gray-200 mt-3 leading-relaxed">
                Built for serious investors. Every detail engineered for security, transparency, and maximum returns.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border)]">
              <Image src={CRYPTO_IMAGES.trading} alt="Trading" width={600} height={300} className="w-full h-[260px] object-cover" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-xl p-5 hover:border-[var(--gold)] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-[var(--gold-glow)] flex items-center justify-center text-[var(--gold)] mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-2xl mb-2">{f.title}</h3>
                <p className="text-lg text-gray-200 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE TRANSACTIONS ─────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionTag>Activity</SectionTag>
            <h2 className="font-display text-4xl font-bold mt-2">Live <span className="text-gold-grad">Transactions</span></h2>
          </div>
          <div className="grid  lg:grid-cols-2 gap-6">
            {[
  { title: "Recent Deposits", items: DEPOSITS, positive: true },
  { title: "Recent Withdrawals", items: WITHDRAWALS, positive: false },
].map((col) => {
  const size = 1;

  // ✅ EACH column gets its own scroll state
  const { page } = useAutoScroll(col.items.length, 1, 5000);

  const visibleItems = col.items.slice(page, page + size);

  return (
    <div
      key={col.title + page}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${col.positive ? "bg-[var(--green)]" : "bg-[var(--gold)]"}`} />
        <span className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">
          {col.title}
        </span>
      </div>

      {/* SCROLL AREA */}
      <div className="h-[100px] overflow-hidden">
        <div className="animate-scroll-up">
          {visibleItems.map((d, i) => (
            <div
              key={i}
              className="h-[60px] flex justify-between items-center px-5 border-b border-[var(--border)] last:border-0"
            >
              <div>
                <p className="font-semibold text-sm">{d.name}</p>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">
                  just {col.positive ? "deposited" : "withdrew"}
                </p>
              </div>

              <p className={`font-mono font-bold text-sm ${col.positive ? "text-[var(--green)]" : "text-[var(--gold)]"}`}>
                {col.positive ? "+" : ""}
                {formatUSD(d.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
})}
            {/* {[
              { title: "Recent Deposits", items: visibleItems, positive: true },
              { title: "Recent Withdrawals", items: WITHDRAWALS, positive: false },
            ].map((col) => (
              <div key={col.title+page} className="glass rounded-2xl overflow-hidden animate-scroll-up">
                <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.positive ? "bg-[var(--green)]" : "bg-[var(--gold)]"}`} />
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">{col.title}</span>
                </div>
                {col.items.map((d, i) => (
                  <div key={i} className="flex justify-between items-center px-5 py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-3)] transition-colors">
                    <div>
                      <p className="font-semibold text-sm">{d.name}</p>
                      <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">just {col.positive ? "deposited" : "withdrew"}</p>
                    </div>
                    <p className={`font-mono font-bold text-sm ${col.positive ? "text-[var(--green)]" : "text-[var(--gold)]"}`}>
                      {col.positive ? "+" : ""}{formatUSD(d.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ))} */}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-[var(--bg-2)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-2xl overflow-hidden mb-10 border border-[var(--border)]">
            <Image src={CRYPTO_IMAGES.phoneTrading} alt="Mobile trading" width={800} height={320} className="w-full h-72 object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-2)] via-[var(--bg-2)]/40 to-transparent" />
          </div>
          <SectionTag>Get Started</SectionTag>
          <h2 className="font-display text-4xl font-bold mt-2 mb-4">
            Ready to Start <span className="text-gold-grad">Earning?</span>
          </h2>
          <p className="text-lg text-gray-200 mb-8">Join 453,000+ investors earning daily returns with Wealtment Limited.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-base hover:opacity-90 transition-opacity shadow-xl shadow-[var(--gold-glow)]">
            Open Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
