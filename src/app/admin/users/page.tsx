


"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashLayout } from "@/components/layout/DashLayout";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { Modal } from "@/components/ui/Modal";
import { getUser } from "@/lib/auth";
import { apiGetAllUsers, apiFundUser, apiDeductUser, apiDeleteUser, apiEmailAll, apiEmailSelected ,apiEditUser} from "@/lib/api";
import { formatUSD } from "@/lib/utils";
import {
  Search, Users, Loader, CheckCircle, TrendingUp, Shield,
  DollarSign, Mail, ChevronLeft, ChevronRight, MinusCircle,
  Send, UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  balance: number;
  bitcoinAddress?: string;
  litecoinAddress?: string;
  referralCode?: string;
  referralEarnings: number;
  hasInvested: boolean;
  createdAt: string;
  password?: string; // Only used for editing, not returned by API
}

// type ModalType = "fund" | "deduct" | "email-all" | "email-selected" | null;

type ModalType = "fund" | "deduct" | "email-all" | "email-selected" | "edit" | null;
const PAGE_SIZE = 10;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users,       setUsers]       = useState<AdminUserRow[]>([]);
  const [search,      setSearch]      = useState("");
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);

  // Fund / Deduct modal
  const [modal,       setModal]       = useState<ModalType>(null);
  const [selectedUser,setSelectedUser]= useState<AdminUserRow | null>(null);
  const [actionAmt,   setActionAmt]   = useState("");
  const [actionId,    setActionId]    = useState<string | null>(null);

  // Email modal
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [pickedIds,    setPickedIds]    = useState<Set<string>>(new Set());
  const [emailSearch,  setEmailSearch]  = useState("");
  const [sending,      setSending]      = useState(false);

  const [editName, setEditName] = useState("");
const [editEmail, setEditEmail] = useState("");
const [editBTC, setEditBTC] = useState("");
const [editLTC, setEditLTC] = useState("");
const [editPassword, setEditPassword] = useState("");


const openEdit = (u: AdminUserRow) => {
  setSelectedUser(u);
  setEditName(u.name || "");
  setEditEmail(u.email || "");
  setEditBTC(u.bitcoinAddress || "");
  setEditLTC(u.litecoinAddress || "");
  setEditPassword(u.password || "");
  setModal("edit");
};
const handleEditUser = async () => {
  console.log('selec',selectedUser)
  if (!selectedUser) return;

  try {
    await apiEditUser(
      selectedUser._id,
      editName,
      editEmail,
      editBTC,
      editLTC,
      editPassword,
    );

    // update UI instantly
    setUsers((prev) =>
      prev.map((u) =>
        u._id === selectedUser._id
          ? {
              ...u,
              name: editName,
              email: editEmail,
              bitcoinAddress: editBTC,
              litecoinAddress: editLTC,
            }
          : u
      )
    );

    toast.success("User updated successfully");
    closeModal();
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : "Failed to update user");
  }
};
  const fetchData = useCallback(async () => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    if (!u.isAdmin) { router.replace("/user/dashboard"); return; }
    try {
      const res = await apiGetAllUsers();
      setUsers(res.users ?? []);
      console.log('users',res.users)
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = users.filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [search]);

  const totalBalance  = users.reduce((s, u) => s + (u.balance ?? 0), 0);
  const totalInvested = users.filter((u) => u.hasInvested).length;
console.log('selectedUser',selectedUser)
  // ── Actions ───────────────────────────────────────────────────────────────
  const openFund   = (u: AdminUserRow) => { setSelectedUser(u); setActionAmt(""); setModal("fund"); };
  const openDeduct = (u: AdminUserRow) => { setSelectedUser(u); setActionAmt(""); setModal("deduct"); };
  const closeModal = () => { setModal(null); setSelectedUser(null); setActionAmt(""); setEmailSubject(""); setEmailMessage(""); setPickedIds(new Set()); setEmailSearch(""); };

  const handleFund = async () => {
    const amt = parseFloat(actionAmt);
    if (!amt || amt <= 0 || !selectedUser) { toast.error("Enter a valid amount."); return; }
    setActionId(selectedUser._id);
    try {
      await apiFundUser(selectedUser._id, amt);
      setUsers((p) => p.map((u) => u._id === selectedUser._id ? { ...u, balance: u.balance + amt } : u));
      toast.success(`${selectedUser.name} funded +${formatUSD(amt)}`);
      closeModal();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed."); }
    finally { setActionId(null); }
  };

  const handleDeduct = async () => {
    const amt = parseFloat(actionAmt);
    if (!amt || amt <= 0 || !selectedUser) { toast.error("Enter a valid amount."); return; }
    if (amt > selectedUser.balance) { toast.error("Amount exceeds user balance."); return; }
    setActionId(selectedUser._id);
    try {
      await apiDeductUser(selectedUser._id, amt);
      setUsers((p) => p.map((u) => u._id === selectedUser._id ? { ...u, balance: u.balance - amt } : u));
      toast.success(`${selectedUser.name} deducted -${formatUSD(amt)}`);
      closeModal();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed."); }
    finally { setActionId(null); }
  };
const [loadingDelete,setLoadingDelete]=useState(false)
  const handleDeleteUser = async (id:string) => {
    setLoadingDelete(true)
    try {
      await apiDeleteUser(id);
      // setUsers((p) => p.map((u) => u._id === selectedUser._id ? { ...u, balance: u.balance - amt } : u));
      setUsers((p)=>p.filter((item)=>item._id!==id))
      toast.success(`user deleted successfully`);
      closeModal();
      setLoadingDelete(false)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed."); }
    finally { setActionId(null), setLoadingDelete(false) }
  };

  const handleEmailAll = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) { toast.error("Subject and message are required."); return; }
    setSending(true);
    try {
      await apiEmailAll(emailSubject, emailMessage);
      toast.success("Email sent to all users!");
      closeModal();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed."); }
    finally { setSending(false); }
  };

  const handleEmailSelected = async () => {
    if (pickedIds.size === 0) { toast.error("Select at least one user."); return; }
    if (!emailSubject.trim() || !emailMessage.trim()) { toast.error("Subject and message are required."); return; }
    setSending(true);
    try {
      await apiEmailSelected(Array.from(pickedIds), emailSubject, emailMessage);
      toast.success(`Email sent to ${pickedIds.size} user(s)!`);
      closeModal();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed."); }
    finally { setSending(false); }
  };

  const togglePick = (id: string) => {
    setPickedIds((p) => {
      const next = new Set(p);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const emailFilteredUsers = users.filter((u) =>
    !emailSearch ||
    u.name.toLowerCase().includes(emailSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(emailSearch.toLowerCase())
  );

  // ── Spinner util ──────────────────────────────────────────────────────────
  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashLayout variant="admin">
      <CryptoTicker />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
              {/* <Users className="text-[var(--gold)]" size={26} />  */}
              All Users
            </h1>
            <p className="text-[var(--muted)] text-sm mt-0.5">
              {loading ? "Loading…" : `${users.length} registered users`}
            </p>
          </div>
          {/* Email action buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setModal("email-selected")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--teal)] text-[var(--teal)] text-xs font-bold hover:bg-[var(--teal-glow)] transition-colors">
              <UserCheck size={13} /> Select Email
            </button>
            <button onClick={() => setModal("email-all")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black text-xs font-bold hover:opacity-90 transition-opacity">
              <Mail size={13} /> Email All Users
            </button>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-[var(--gold)]"/><p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Total Users</p></div>
              <p className="font-display text-2xl font-bold text-[var(--gold)]">{users.length}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-[var(--green)]"/><p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Total Balance</p></div>
              <p className="font-display text-2xl font-bold text-[var(--green)]">{formatUSD(totalBalance)}</p>
            </div>
            <div className="glass rounded-xl p-4 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-1"><CheckCircle size={14} className="text-[var(--teal)]"/><p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Invested</p></div>
              <p className="font-display text-2xl font-bold text-[var(--teal)]">{totalInvested}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-4 py-2.5">
          <Search size={14} className="text-[var(--muted)] shrink-0" />
          <input className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--muted)] text-[var(--text)]"
            placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <span className="text-xs text-[var(--muted)] shrink-0">{filtered.length} results</span>}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader size={28} className="text-[var(--gold)] animate-spin" /></div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">

            {/* ── Mobile cards ── */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {paginated.length === 0 ? (
                <p className="text-center text-[var(--muted)] text-sm py-14">No users found.</p>
              ) : paginated.map((u) => (
                <div key={u._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--gold-glow)] border border-[rgba(212,168,67,0.2)] flex items-center justify-center text-[var(--gold)] font-bold text-sm shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{u.name}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {u.role === "admin" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(212,168,67,0.12)] text-[var(--gold)] border border-[rgba(212,168,67,0.3)] flex items-center gap-1"><Shield size={9} /> Admin</span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${u.hasInvested ? "text-[var(--green)] border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)]" : "text-[var(--muted)] border-[var(--border)] bg-[var(--bg-3)]"}`}>
                        {u.hasInvested ? "✓ Invested" : "Not invested"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[var(--bg-3)] rounded-lg px-3 py-2">
                      <p className="text-[var(--muted)] uppercase tracking-widest text-[9px]">Balance</p>
                      <p className="font-mono font-bold text-[var(--gold)] mt-0.5">{formatUSD(u.balance)}</p>
                    </div>
                    <div className="bg-[var(--bg-3)] rounded-lg px-3 py-2">
                      <p className="text-[var(--muted)] uppercase tracking-widest text-[9px]">Referral</p>
                      <p className="font-mono font-bold text-[var(--teal)] mt-0.5">{formatUSD(u.referralEarnings)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openFund(u)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[rgba(52,211,153,0.3)] text-[var(--green)] bg-[rgba(52,211,153,0.06)] hover:bg-[rgba(52,211,153,0.14)] transition-colors">
                      <DollarSign size={12} /> Fund
                    </button>
                    <button onClick={() => openDeduct(u)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[rgba(248,113,113,0.3)] text-[var(--red)] bg-[rgba(248,113,113,0.06)] hover:bg-[rgba(248,113,113,0.14)] transition-colors">
                      <MinusCircle size={12} /> Deduct
                    </button>
                    <button
  onClick={() => openEdit(u)}
  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[var(--teal)] text-[var(--teal)] bg-[var(--teal-glow)] hover:opacity-80 transition-colors"
>
  Edit
</button>
       <button
  onClick={() => handleDeleteUser(u._id)}
  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[var(--teal)] text-white bg-red-500 hover:opacity-80 transition-colors"
>
 

  {loadingDelete? "Deleting..":"Delete"}
</button>
                  </div>
                  <p className="text-xs text-[var(--muted)]">Joined {fmtDate(u.createdAt)}</p>
                </div>
              ))}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
                    {["User", "Role", "Balance", "Referral", "Invested?", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-16 text-[var(--muted)] text-sm">No users found.</td></tr>
                  ) : paginated.map((u) => (
                    <tr key={u._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)] last:border-0 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--gold-glow)] border border-[rgba(212,168,67,0.2)] flex items-center justify-center text-[var(--gold)] font-bold text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{u.name}</p>
                            <p className="text-xs text-[var(--muted)] truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {u.role === "admin"
                          ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[rgba(212,168,67,0.12)] text-[var(--gold)] border border-[rgba(212,168,67,0.3)]"><Shield size={9} /> Admin</span>
                          : <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--bg-3)] text-[var(--muted)] border border-[var(--border)]">User</span>
                        }
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-[var(--gold)]">{formatUSD(u.balance)}</td>
                      <td className="px-5 py-4 font-mono text-[var(--teal)]">{formatUSD(u.referralEarnings)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${u.hasInvested ? "text-[var(--green)] border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)]" : "text-[var(--muted)] border-[var(--border)] bg-[var(--bg-3)]"}`}>
                          {u.hasInvested ? "✓ Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openFund(u)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[rgba(52,211,153,0.3)] text-[var(--green)] bg-[rgba(52,211,153,0.06)] hover:bg-[rgba(52,211,153,0.14)] transition-colors flex items-center gap-1">
                            <DollarSign size={10} /> Fund
                          </button>
                          <button onClick={() => openDeduct(u)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[rgba(248,113,113,0.3)] text-[var(--red)] bg-[rgba(248,113,113,0.06)] hover:bg-[rgba(248,113,113,0.14)] transition-colors flex items-center gap-1">
                            <MinusCircle size={10} /> Deduct
                          </button>
                          <button
  onClick={() => openEdit(u)}
  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[var(--teal)] text-[var(--teal)] bg-[var(--teal-glow)]"
>
  Edit
</button>
  <button
  onClick={() => handleDeleteUser(u._id)}
  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[var(--teal)] text-white bg-red-500 hover:opacity-80 transition-colors"
>
 

  {loadingDelete? "Deleting..":"Delete"}
</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${page === p ? "border-[var(--gold)] bg-[var(--gold-glow)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-2)]"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Fund Modal ── */}
      <Modal open={modal === "fund"} onClose={closeModal} title={`Fund ${selectedUser?.name ?? "User"}`} subtitle={`Current balance: ${formatUSD(selectedUser?.balance ?? 0)}`}>
        <div className="space-y-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Amount to Add (USD)</label>
            <div className="relative">
              <input type="number" step="any" min="1" placeholder="e.g. 500" value={actionAmt} onChange={(e) => setActionAmt(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors font-mono" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--gold)]">$</span>
            </div>

            <div>
              
              <p className="text-xs text-[var(--muted)] mt-1">
                Btc Add: <span className="text-[var(--green)] font-semibold">{selectedUser?.bitcoinAddress}</span>
              </p>
           <p className="text-xs text-[var(--muted)] mt-1">
                Ltc Add: <span className="text-[var(--green)] font-semibold">{selectedUser?.litecoinAddress}</span>
              </p>
            </div>
            {parseFloat(actionAmt) > 0 && (
              <p className="text-xs text-[var(--muted)] mt-1">
                New balance: <span className="text-[var(--green)] font-semibold">{formatUSD((selectedUser?.balance ?? 0) + parseFloat(actionAmt))}</span>
              </p>
            )}
          </div>
          <button onClick={handleFund} disabled={actionId === selectedUser?._id}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
            {actionId === selectedUser?._id ? <><Spinner /> Processing…</> : <><DollarSign size={15} /> Fund User Account</>}
          </button>
        </div>
      </Modal>

      {/* ── Deduct Modal ── */}
      <Modal open={modal === "deduct"} onClose={closeModal} title={`Deduct from ${selectedUser?.name ?? "User"}`} subtitle={`Current balance: ${formatUSD(selectedUser?.balance ?? 0)}`}>
        <div className="space-y-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Amount to Deduct (USD)</label>
            <div className="relative">
              <input type="number" step="any" min="1" max={selectedUser?.balance} placeholder="e.g. 100" value={actionAmt} onChange={(e) => setActionAmt(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors font-mono" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--red)]">$</span>
            </div>
            {parseFloat(actionAmt) > 0 && (
              <p className="text-xs text-[var(--muted)] mt-1">
                New balance: <span className="text-[var(--red)] font-semibold">{formatUSD(Math.max(0, (selectedUser?.balance ?? 0) - parseFloat(actionAmt)))}</span>
              </p>
            )}
          </div>
          <button onClick={handleDeduct} disabled={actionId === selectedUser?._id}
            className="w-full py-3.5 rounded-xl bg-[rgba(248,113,113,0.15)] border border-[rgba(248,113,113,0.4)] text-[var(--red)] font-bold text-sm hover:bg-[rgba(248,113,113,0.25)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {actionId === selectedUser?._id ? <><Spinner /> Processing…</> : <><MinusCircle size={15} /> Deduct from Balance</>}
          </button>
        </div>
      </Modal>
<Modal
  open={modal === "edit"}
  onClose={closeModal}
  title={`Edit ${selectedUser?.name ?? "User"}`}
>
  <div className="space-y-4 mt-2">

    <input
      type="text"
      placeholder="Name"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)]"
    />

    <input
      type="email"
      placeholder="Email"
      value={editEmail}
      onChange={(e) => setEditEmail(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)]"
    />

    <input
      type="text"
      placeholder="Bitcoin Address"
      value={editBTC}
      onChange={(e) => setEditBTC(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)]"
    />

    <input
      type="text"
      placeholder="Litecoin Address"
      value={editLTC}
      onChange={(e) => setEditLTC(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)]"
    />
    <input
      type="text"
      placeholder="Password"
      value={editPassword}
      onChange={(e) => setEditPassword(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)]"
    />

    <button
      onClick={handleEditUser}
      className="w-full py-3 rounded-xl bg-[var(--teal)] text-black font-bold"
    >
      Save Changes
    </button>
  </div>
</Modal>
      {/* ── Email All Modal ── */}
      <Modal open={modal === "email-all"} onClose={closeModal} title="Email All Users" subtitle={`Will be sent to all ${users.length} users`}>
        <div className="space-y-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Subject *</label>
            <input type="text" placeholder="e.g. Special Announcement" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Message *</label>
            <textarea rows={5} placeholder="Type your message here…" value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors resize-none" />
          </div>
          <button onClick={handleEmailAll} disabled={sending}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
            {sending ? <><Spinner /> Sending…</> : <><Send size={15} /> Send to All {users.length} Users</>}
          </button>
        </div>
      </Modal>

      {/* ── Email Selected Modal ── */}
      <Modal open={modal === "email-selected"} onClose={closeModal} title="Email Selected Users" subtitle={pickedIds.size > 0 ? `${pickedIds.size} user(s) selected` : "Search and select users below"}>
        <div className="space-y-4 mt-2">
          {/* User picker */}
          <div>
            <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)] mb-2 block">Select Recipients</label>
            <div className="flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl px-3 py-2 mb-2">
              <Search size={13} className="text-[var(--muted)] shrink-0" />
              <input className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--muted)] text-[var(--text)]"
                placeholder="Search users…" value={emailSearch} onChange={(e) => setEmailSearch(e.target.value)} />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-[var(--border)] rounded-xl p-2 bg-[var(--bg-3)]">
              {emailFilteredUsers.map((u) => (
                <label key={u._id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${pickedIds.has(u._id) ? "bg-[var(--gold-glow)]" : "hover:bg-[var(--bg-2)]"}`}>
                  <input type="checkbox" checked={pickedIds.has(u._id)} onChange={() => togglePick(u._id)} className="accent-[var(--gold)]" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-[var(--muted)] truncate">{u.email}</p>
                  </div>
                  {pickedIds.has(u._id) && <CheckCircle size={14} className="text-[var(--gold)] ml-auto shrink-0" />}
                </label>
              ))}
              {emailFilteredUsers.length === 0 && <p className="text-center text-[var(--muted)] text-xs py-4">No users found.</p>}
            </div>
            {pickedIds.size > 0 && (
              <button onClick={() => setPickedIds(new Set())} className="text-xs text-[var(--muted)] hover:text-[var(--red)] mt-1.5 transition-colors">
                Clear selection
              </button>
            )}
          </div>

          {/* Email form */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Subject *</label>
            <input type="text" placeholder="e.g. Special Notice" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--muted)]">Message *</label>
            <textarea rows={4} placeholder="Type your message…" value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--gold)] transition-colors resize-none" />
          </div>

          <button onClick={handleEmailSelected} disabled={sending || pickedIds.size === 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
            {sending ? <><Spinner /> Sending…</> : <><Send size={15} /> Send to {pickedIds.size} User{pickedIds.size !== 1 ? "s" : ""}</>}
          </button>
        </div>
      </Modal>
    </DashLayout>
  );
}
