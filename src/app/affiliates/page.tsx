import Image from "next/image";
import Link from "next/link";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { SectionTag } from "@/components/ui/SectionTag";
import { CRYPTO_IMAGES } from "@/lib/data";
import { UserPlus, Wrench, DollarSign, ArrowRight } from "lucide-react";

export default function AffiliatesPage() {
  return (
    <>
      <CryptoTicker />
      <section className="pt-32 pb-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto">

          {/* Hero */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="anim-slide">
              <SectionTag>Affiliate Program</SectionTag>
              <h1 className="font-display text-5xl font-black mt-3 mb-6">
                Earn Without <span className="text-gold-grad">Investing</span>
              </h1>
              <p className="text-lg text-gray-200 leading-relaxed mb-4">
                Even if you do not make a deposit, it is still possible to earn with Wealtment Limited! Take part in our referral program which offers commissions up to 10%.
              </p>
              <p className="text-lg text-gray-200 leading-relaxed mb-8">
                You earn a percentage of every deposit made through your referral link. Commissions are immediately credited and can be withdrawn instantly!
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity">
                Start Earning <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl">
              <Image src={CRYPTO_IMAGES.wallet} alt="Earnings" width={600} height={420} className="w-full h-[400px] object-cover" />
            </div>
          </div>

          {/* Commission tiers */}
          <div className="text-center mb-10">
            <SectionTag>Commission Structure</SectionTag>
            <h2 className="font-display text-3xl font-bold mt-2">Up to <span className="text-gold-grad">10% Referral Bonus</span></h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 mb-24">
            {[{ level: "Level 1", pct: "6%", desc: "Direct referrals — highest commission tier" },
              { level: "Level 2", pct: "3%", desc: "Referrals of your referrals" },
              { level: "Level 3", pct: "1%", desc: "Third-tier network earnings" }].map((t) => (
              <div key={t.level} className="glass rounded-2xl p-8 text-center hover:border-[var(--gold)] transition-colors">
                <p className="font-display text-6xl font-black text-gold-grad mb-2">{t.pct}</p>
                <p className="text-xs font-bold tracking-[2px] uppercase text-[var(--muted)] mb-3">{t.level}</p>
                <p className="text-lg text-gray-200">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: <UserPlus size={22} />, title: "How to Start", text: "Register a new account, log in and copy your personal referral link from the member area. Share it to start earning." },
              { icon: <Wrench size={22} />, title: "Referral Tools", text: "Access banners of different sizes with pre-embedded referral links from the Banners section in your account." },
              { icon: <DollarSign size={22} />, title: "Instant Commissions", text: "Referral commissions are immediately credited to your balance and can be withdrawn at any time with no delay." },
            ].map((f) => (
              <div key={f.title} className="glass rounded-xl p-6 hover:border-[var(--gold)] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-[var(--gold-glow)] flex items-center justify-center text-[var(--gold)] mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2 text-2xl">{f.title}</h3>
                <p className="text-lg text-gray-200 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
