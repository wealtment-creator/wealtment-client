"use client";
import { useEffect, useState } from "react";

import { apiGetPlans, } from "@/lib/api";
import { formatUSD, } from "@/lib/utils";
import {  ArrowRight,  Loader } from "lucide-react";
import type {  Plan, } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

export default function UserPackagesPage({show}:{show:boolean}) {
  const [plans,       setPlans]       = useState<Plan[]>([]);


  const [loadingPlans,setLoadingPlans]= useState(true);

  

 
const load = async () => {
  try {
    const pr = await apiGetPlans();
    setPlans(pr.packages ?? []);
  } catch {
    toast.error("Failed to load plans.");
  } finally {
    setLoadingPlans(false);
  }
};
  

useEffect(() => {
  load();
}, []);
  const rate   = (p: Plan) => p.profitPercentage ?? p.returnRate ?? p.pct ?? 0;
  const minAmt = (p: Plan) => p.minimumDeposit ?? p.minAmount ?? p.min ?? 0;
  const maxAmt = (p: Plan) => p.maximumDeposit ?? p.maxAmount ?? p.max ?? null;
  const durationLabel = (p: Plan) => {
    if (typeof p.duration === "string") return p.duration;
    if (typeof p.duration === "number") return `${p.duration}  hour(s)`;
    if (p.days != null) return `${p.days}d`;
    return "—";
  };

  return (
     <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
       {show&& <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Investment Plans</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">Choose a plan and start growing your capital.</p>
        </div>}

        {loadingPlans ? (
          <div className="flex items-center justify-center py-20"><Loader size={28} className="text-[var(--gold)] animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {plans.slice(0, 4).map((p) => {
              return (
                <div key={p._id} className="relative rounded-2xl p-5 sm:p-6 flex flex-col transition-all hover:-translate-y-1 border border-[var(--gold)] bg-gradient-to-b from-[rgba(212,168,67,0.05)] to-[var(--bg-card)]" >
                  <button className="text-[10px] font-bold p-3 rounded-full tracking-[2px] uppercase text-center text-lg  text-black mb-3 bg-[var(--gold)]">{p.name}</button>
                  <p className="font-display text-4xl sm:text-5xl font-black text-[var(--gold)]">{rate(p)}%</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 mb-1">ROI</p>
                  <p className="text-lg font-semibold text-[var(--teal)] mb-4">After {durationLabel(p)}</p>
                  <div className="border-t border-[var(--border)] pt-3 space-y-2 flex-1">
                    {[["Min", formatUSD(minAmt(p))], ["Max", maxAmt(p) ? formatUSD(maxAmt(p)!) : "Unlimited"], ["Duration", durationLabel(p)]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs sm:text-sm"><span className="text-[var(--muted)]">{k}</span><span className="font-semibold">{v}</span></div>
                    ))}
                  </div>
                <Link href="/signup" className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black text-sm font-bold hover:opacity-90 transition-opacity">
                  Get Started <ArrowRight size={15} />
                </Link>
                </div>
              );
            })}
            {plans.length === 0 && <div className="col-span-4 text-center py-16 text-[var(--muted)]">No plans available yet.</div>}
          </div>
        )}

      
      </div>

    </>
  );
}


