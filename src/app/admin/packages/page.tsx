"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { getUser } from "@/lib/auth";
import { apiGetPlans, apiCreatePlan, apiUpdatePlan, apiDeletePlan } from "@/lib/api";
import { formatUSD } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader } from "lucide-react";
import toast from "react-hot-toast";
import type { Plan } from "@/types";

const EMPTY: Partial<Plan> = { name: "", returnRate: 0, days: 0, minAmount: 0, maxAmount: null };

export default function AdminPackagesPage() {
  const router = useRouter();
  const [plans,   setPlans]   = useState<Plan[]>([]);
  const [modal,   setModal]   = useState<"add" | "edit" | null>(null);
  const [form,    setForm]    = useState<Partial<Plan>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [fetching,setFetching]= useState(true);

  const fetchPlans = useCallback(async () => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    if (!u.isAdmin) { router.replace("/user/dashboard"); return; }
    try {
      const res = await apiGetPlans();
      console.log('plan response', res)
      setPlans(res.packages ?? []);
    } catch { toast.error("Failed to load plans."); }
    finally { setFetching(false); }
  }, [router]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openAdd  = () => { setForm(EMPTY); setModal("add"); };
  const openEdit = (p: Plan) => { setForm({ ...p }); setModal("edit"); };

  const handleSave = async () => {
    if (!form.name || (!form.returnRate && !form.pct) || !form.days || (!form.minAmount && !form.min)) {
      toast.error("Fill all required fields."); return;
    }
    setLoading(true);
    try {
      const payload = {
        name:      form.name,
        profitPercentage:form.returnRate ?? form.pct ?? 0,
        duration:      form.days,
        minimumDeposit: form.minAmount ?? form.min ?? 0,
        maximumDeposit: form.maxAmount ?? form.max ?? null,
        // featured:  form.featured ?? false,

      };
      if (modal === "add") {
        // POST /plans
        const res = await apiCreatePlan(payload);
        setPlans((p) => [...p, res.
packageData]);
        
        console.log('res',res)
        toast.success("Plan created!");
      } else {
        // PUT /plans/:id
        const res = await apiUpdatePlan(form._id!, payload);
        console.log('editres', res)
        setPlans((p) => p.map((x) => x._id === form._id ? res.updated : x));
        toast.success("Plan updated!");
      }
      setModal(null);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Save failed."); console.log('error',e)}
    finally { setLoading(false); }
  };

  const handleDelete = async (p: Plan) => {
    if (!confirm(`Delete "${p.name}" plan? This cannot be undone.`)) return;
    try {
      // DELETE /plans/:id
      // await apiDeletePlan(p._id);
      setPlans((prev) => prev.filter((x) => x._id !== p._id));
      toast.success("Plan deleted.");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Delete failed."); }
  };

  const rate    = (p: Plan) => p.profitPercentage ?? p.pct ?? 0;
  const minAmt  = (p: Plan) => p.minimumDeposit ?? p.min  ?? 0;
  const maxAmt  = (p: Plan) => p.maximumDeposit  ?? p.max  ?? null;

  return (
    <DashLayout variant="admin">
      <CryptoTicker />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Plan Management</h1>
            <p className="text-[var(--muted)] text-sm mt-0.5">Create, edit and delete investment plans.</p>
          </div>
          <Button onClick={openAdd} size="md" className="self-start sm:self-auto"><Plus size={15} /> Add Plan</Button>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-20"><Loader size={28} className="text-[var(--gold)] animate-spin" /></div>
        ) : (
          <>
          {/* 


: 
999
minimumDeposit
: 
1
name
: 
"Gold plan"

: 
10
updatedAt
: 
"2026-04-12T19:04:03.470Z" */}
            {/* Cards */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {plans.map((p) => (
                <div key={p._id} className="relative rounded-2xl p-5 border border-[var(--border)] bg-[var(--bg-card)] flex flex-col transition-all hover:-translate-y-1">
                  <p className="text-[10px] font-bold tracking-[2px] uppercase text-[var(--muted)] mb-2">{p.name}</p>
                  <p className="font-display text-4xl font-black text-[var(--gold)] mb-1"> <span className="text-xs">ROI</span>  {rate(p)}%</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 mb-4">After  {p.duration} hour(s)</p>
                  <div className="space-y-1.5 flex-1 text-xs">
                    <div className="flex justify-between"><span className="text-[var(--muted)]">Min</span><span>${(minAmt(p))}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--muted)]">Max</span><span>${maxAmt(p) ? (maxAmt(p)!) : "Unlimited"}</span></div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[rgba(45,212,191,0.3)] text-[var(--teal)] hover:bg-[rgba(45,212,191,0.1)] transition-colors">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[rgba(248,113,113,0.3)] text-[var(--red)] hover:bg-[rgba(248,113,113,0.1)] transition-colors">
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {plans.length === 0 && (
                <div className="col-span-4 py-16 text-center text-[var(--muted)] text-sm">No plans yet. Click "Add Plan" to create one.</div>
              )}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
              <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-semibold text-sm">All Plans</h2>
                <span className="text-xs text-[var(--muted)]">{plans.length} total</span>
              </div>
              {/* Mobile list */}
              <div className="md:hidden divide-y divide-[var(--border)]">
                {plans.map((p) => (
                  <div key={p._id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--gold)]">{p.name?? p.name}</span>
                        {p.featured && <Badge variant="yellow">Featured</Badge>}
                      </div>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{rate(p)}% · {p.days}d · Min {formatUSD(minAmt(p))}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center border border-[rgba(45,212,191,0.3)] text-[var(--teal)] bg-[rgba(45,212,191,0.06)] hover:bg-[rgba(45,212,191,0.14)] transition-colors"><Pencil size={12} /></button>
                      <button onClick={() => handleDelete(p)} className="w-8 h-8 rounded-lg flex items-center justify-center border border-[rgba(248,113,113,0.3)] text-[var(--red)] bg-[rgba(248,113,113,0.06)] hover:bg-[rgba(248,113,113,0.14)] transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">{["Name","ROI","Duration","Min","Max","Featured","Actions"].map((h) => <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody>
                    {plans.map((p) => (
                      <tr key={p._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
                        <td className="px-5 py-4 font-bold text-[var(--gold)]">{p.name}</td>
                        <td className="px-5 py-4 font-mono text-[var(--green)]">{rate(p)}%</td>
                        <td className="px-5 py-4">{p.duration} hour(s)</td>
                        <td className="px-5 py-4 font-mono">{(minAmt(p))}</td>
                        <td className="px-5 py-4 font-mono">{maxAmt(p) ?(maxAmt(p)!) : "Unlimited"}</td>
                        <td className="px-5 py-4"><Badge variant={p.featured ? "yellow" : "muted"}>{p.featured ? "Yes" : "No"}</Badge></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[rgba(45,212,191,0.3)] text-[var(--teal)] bg-[rgba(45,212,191,0.06)] hover:bg-[rgba(45,212,191,0.14)] transition-colors"><Pencil size={10} /> Edit</button>
                            <button onClick={() => handleDelete(p)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[rgba(248,113,113,0.3)] text-[var(--red)] bg-[rgba(248,113,113,0.06)] hover:bg-[rgba(248,113,113,0.14)] transition-colors"><Trash2 size={10} /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "add" ? "Add New Plan" : "Edit Plan"} subtitle="Configure investment plan settings.">
        <div className="space-y-4 mt-2">
          <Input label="Plan Name *" placeholder="e.g. DIAMOND" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ROI % *" type="number" min="1" placeholder="e.g. 50" value={form.returnRate ?? form.pct ?? ""} onChange={(e) => setForm({ ...form, returnRate: Number(e.target.value), pct: Number(e.target.value) })} />
            <Input label="Duration (hours) *" type="number" min="1" placeholder="e.g. 3" value={form.days ?? ""} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min Amount *" type="number" min="1" placeholder="e.g. 100" value={form.minAmount ?? form.min ?? ""} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value), min: Number(e.target.value) })} />
            <Input label="Max Amount " type="number" placeholder="Empty = unlimited" value={form.maxAmount ?? form.max ?? ""} onChange={(e) => setForm({ ...form, maxAmount: e.target.value ? Number(e.target.value) : null, max: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-3)] border border-[var(--border)]">
            <span className="text-sm font-medium">Mark as Featured</span>
            <button type="button" onClick={() => setForm({ ...form, featured: !form.featured })} className={`relative w-11 h-6 rounded-full transition-colors ${form.featured ? "bg-[var(--gold)]" : "bg-[var(--bg-2)] border border-[var(--border-2)]"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <Button onClick={handleSave} loading={loading} className="w-full" size="lg">
            {modal === "add" ? "Create Plan" : "Save Changes"}
          </Button>
        </div>
      </Modal>
    </DashLayout>
  );
}
