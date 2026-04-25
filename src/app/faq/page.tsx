"use client";
import { useState } from "react";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { SectionTag } from "@/components/ui/SectionTag";
import { FAQS } from "@/lib/data";
import { ChevronDown } from "lucide-react";

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <CryptoTicker />
      <section className="pt-32 pb-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <SectionTag>FAQ</SectionTag>
            <h1 className="font-display text-5xl font-black mt-2">Frequently Asked <span className="text-gold-grad">Questions</span></h1>
            <p className="text-[var(--muted-2)] mt-4">Everything you need to know about Wealtment Limited.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className={`rounded-xl border transition-colors overflow-hidden ${open === i ? "border-[var(--gold)] bg-[rgba(212,168,67,0.04)]" : "border-[var(--border)] bg-[var(--bg-card)]"}`}>
                <button
                  className="w-full flex justify-between items-center px-6 py-5 text-left font-semibold text-sm gap-4"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span>{f.q}</span>
                  <ChevronDown size={16} className={`shrink-0 text-[var(--gold)] transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <div className="px-6 pb-5 text-sm text-[var(--muted-2)] leading-relaxed border-t border-[var(--border)] pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
