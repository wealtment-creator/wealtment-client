import Image from "next/image";
import Link from "next/link";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { SectionTag } from "@/components/ui/SectionTag";
import { CRYPTO_IMAGES } from "@/lib/data";
import { Shield, Server, Lock, Flag, Zap, Globe, CheckCircle, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: <Globe size={20} />, title: "24/7 Customer Support", text: "Support representatives are always available to answer any questions via email." },
  { icon: <Server size={20} />, title: "Dedicated Server", text: "Highest-level DDoS protection on dedicated servers to keep your funds safe." },
  { icon: <Lock size={20} />, title: "EV SSL Security", text: "256-bit encryption from Comodo with Extended Validation verifies our company." },
  { icon: <Flag size={20} />, title: "UK Registered Company", text: "Legally registered in England & Wales as 'WEALTMENT Limited'." },
  { icon: <Zap size={20} />, title: "Instant Withdrawals", text: "All withdrawals processed instantly. Minimum withdrawal is $10." },
  { icon: <Shield size={20} />, title: "DDoS Protection", text: "Our infrastructure resists attacks of any size with enterprise-grade protection." },
];

export default function AboutPage() {
  return (
    <>
      <CryptoTicker />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[var(--gold-glow)] blur-[100px] opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="anim-slide">
            <SectionTag>About Us</SectionTag>
            <h1 className="font-display text-5xl font-black mt-3 mb-6 leading-tight">
              Welcome to <span className="text-gold-grad">Wealtment Limited</span>
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed mb-5">
             Wealtment Limited is a true opportunity to earn on Forex Trading. Nowadays Forex Trading is one of the main payment instruments which can be used online — and we&apos;ve been using digital assets to gain and raise profit since 17th February 2019 
            </p>
            <p className="text-lg text-gray-200 leading-relaxed mb-5">
              We are an officially registered company which gives our clients all required guarantees, including full confidentiality of data provided during registration. We guarantee payment accruals in due time and full amounts.
            </p>
            <p className="text-lg text-gray-200 leading-relaxed mb-8">
              Our company&apos;s system, including support service, works 24 hours a day. You are always welcome to contact our experts with any questions.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--gold)] text-[var(--gold)] text-sm font-semibold hover:bg-[var(--gold-glow)] transition-colors">
                <CheckCircle size={15} /> Verify Certificate
              </button>
              <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black text-sm font-bold hover:opacity-90 transition-opacity">
                Get Started <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl">
            <Image src={CRYPTO_IMAGES.chart} alt="Trading charts" width={600} height={440} className="w-full h-[420px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Full-width image */}
      <section className="relative h-72 border-y border-[var(--border)] overflow-hidden">
        <Image src={CRYPTO_IMAGES.coins} alt="Crypto coins" fill className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-transparent to-[var(--bg)]" />
        <div className="absolute inset-0 flex items-center px-8 sm:px-16">
          <div>
            <h2 className="font-display text-3xl font-black text-gold-grad mb-2">Our Mission</h2>
            <p className=" text-gray-200 max-w-xl text-lg">
              Making professional-grade investment tools accessible to every investor worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission text */}
      <section className="py-20 px-4 sm:px-6 bg-[var(--bg-2)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border)]">
            <Image src={CRYPTO_IMAGES.goldBitcoin} alt="Gold Bitcoin" width={600} height={380} className="w-full h-[360px] object-cover" />
          </div>
          <div>
            <SectionTag>Investment Philosophy</SectionTag>
            <h2 className="font-display text-4xl font-bold mt-3 mb-6">
              Providing <span className="text-gold-grad">Real Opportunities</span>
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed mb-4">
              Wealtment Limited provides its clients with an opportunity to invest money into Forex Trading to obtain a big income later — which can be achieved even without direct client participation.
            </p>
            <p className="text-lg text-gray-200 leading-relaxed mb-6">
              The company actively uses trading bots on digital currency markets, which is very convenient and profitable. We also attract new partners and share our experience with like-minded people worldwide.
            </p>
            {["Algorithmic trading bots active 24/7", "Instant withdrawal processing", "UK regulatory compliance", "Military-grade data encryption"].map((item) => (
              <div key={item} className="flex items-center gap-3 mb-3">
                <CheckCircle size={16} className="text-[var(--gold)] shrink-0" />
                <span className="text-lg text-gray-200]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionTag>Our Guarantees</SectionTag>
            <h2 className="font-display text-4xl font-bold mt-2">Wealtment <span className="text-gold-grad">Features</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-xl p-6 hover:border-[var(--gold)] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-[var(--gold-glow)] flex items-center justify-center text-[var(--gold)] mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className=" text-gray-200 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
