import Link from "next/link";
import { TrendingUp, Shield, Lock, Award } from "lucide-react";

const COLS = [
  {
    title: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Plans", href: "/plans" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Investment Plans", href: "/plans" },
      { label: "Affiliate Program", href: "/affiliates" },
      { label: "Support", href: "/contact" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "AML Policy", href: "#" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-2)] flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-black" />
              </div>
              <span className="font-display font-bold text-base tracking-wider text-gold-grad">WEALTMENT</span>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              Professional Forex & cryptocurrency trading platform. UK registered company providing secure, profitable investment solutions since 17th February 2019 
            </p>
            <div className="flex gap-2 mt-6">
              {[Shield, Lock, Award].map((Icon, i) => (
                <div key={i} className="w-9 h-9 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)]">
                  <Icon size={15} />
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold tracking-[2px] uppercase text-[var(--text)] mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--muted)]">
            © {year} Wealtment Limited. All Rights Reserved. Registered in England &amp; Wales.
          </p>
          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-[var(--gold)]" /> 256-bit SSL</span>
            <span className="flex items-center gap-1.5"><Lock size={12} className="text-[var(--gold)]" /> DDoS Protected</span>
            <span className="flex items-center gap-1.5"><Award size={12} className="text-[var(--gold)]" /> UK Registered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
