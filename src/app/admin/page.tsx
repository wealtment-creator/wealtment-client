"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { StatCard } from "@/components/ui/StatCard";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { getUser } from "@/lib/auth";
import {
  apiGetAllInvestments,
  apiGetAllDeposits,
  apiGetAllWithdrawals,
  
  apiGetPlans,
} from "@/lib/api";
import { Users, DollarSign, Package, TrendingUp, Loader } from "lucide-react";
import toast from "react-hot-toast";
import type { Investment, Deposit, Withdrawal, Plan } from "@/types";
import Deposits from "./deposits/components/PendingDeposits";

export default function AdminOverviewPage() {
  const router = useRouter();
  const [investments,  setInvestments]  = useState<Investment[]>([]);
  const [deposits,     setDeposits]     = useState<Deposit[]>([]);
  const [withdrawals,  setWithdrawals]  = useState<Withdrawal[]>([]);
  const [plans,        setPlans]        = useState<Plan[]>([]);
  const [loading,      setLoading]      = useState(true);

  const fetchData = useCallback(async () => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    if (!u.isAdmin) { router.replace("/user/dashboard"); return; }
    try {
      // const [depRes, invRes, wdRes, planRes] = await Promise.all([
      //   apiGetAllInvestments(),
      //   apiGetAllDeposits(),
      //   apiGetAllWithdrawals(),
      //   apiGetPlans(),
      // ]);
       const [invRes,depRes,wdRes,planRes ] = await Promise.all([
        apiGetAllInvestments(),
        apiGetAllDeposits(),
        apiGetAllWithdrawals(),
        apiGetPlans(),
      ]);
      console.log('inv', invRes,'dep',depRes, 'width', wdRes, 'plans', planRes)
      setInvestments(invRes ?? []);
      setDeposits(depRes?? []);
      setWithdrawals(wdRes?? []);
      setPlans(planRes.packages ?? []);
    } catch { toast.error("Failed to load data."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  

  

  const pendingDeposits    = deposits.filter((d) => d.status === "pending");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");

  const stats = [
    { label: "Total Investments", value: investments.length,       icon: <TrendingUp size={16} />, accent: "var(--gold)" },
    { label: "Active Plans",      value: plans.length,             icon: <Package size={16} />,   accent: "var(--teal)" },
    { label: "Total Deposits",    value: deposits.length,          icon: <DollarSign size={16} />, accent: "var(--green)" },
    { label: "Pending Actions",   value: pendingDeposits.length + pendingWithdrawals.length, icon: <Users size={16} />, accent: "var(--red)" },
  ];

  return (
    <DashLayout variant="admin">
      <CryptoTicker />
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Admin Overview</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">Platform statistics and pending actions.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader size={28} className="text-[var(--gold)] animate-spin" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />)}
            </div>

            {/* Pending Deposits */}
            <div className="rounded-2xl border border-[var(--border)]  bg-[var(--bg-card)]">
              <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)] flex  items-center justify-between">
                <h2 className="font-semibold text-sm">Pending Deposits</h2>
                {/* {
                pendingDeposits.length} */}
<Link href="/admin/deposits" className="font-bold text-xs rounded-full text-[var(--gold)] bg-[var(--gold-glow)] px-2.5 py-0.5">View all</Link>
              </div>
                              

              <Deposits />
            </div>
 
           
          </>
        )}
      </div>
      
    </DashLayout>
  );
}
