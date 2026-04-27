
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp, LayoutDashboard, Package, Users,
  Settings, LogOut, Menu, X, ChevronRight,
  ArrowDownToLine, ArrowUpFromLine, History,
  Gift,
  Mail,
} from "lucide-react";
import { removeUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface NavItem { label: string; href: string; icon: React.ReactNode; exact?: boolean; }

const USER_NAV: NavItem[] = [
  { label: "Dashboard",   href: "/user/dashboard",   icon: <LayoutDashboard size={16} />, exact: true },
  { label: "Packages",    href: "/user/packages",    icon: <Package size={16} /> },
  { label: "Deposit",     href: "/user/deposit",     icon: <ArrowDownToLine size={16} /> },
  { label: "Withdraw",    href: "/user/withdraw",    icon: <ArrowUpFromLine size={16} />, exact: true },
  { label: "Withdrawals", href: "/user/withdrawals", icon: <History size={16} /> },
  { label: "Profile",     href: "/user/profile",     icon: <Settings size={16} /> },
  { label: "Referrals", href: "/user/referrals", icon: <Gift size={16} /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Overview",            href: "/admin",             icon: <LayoutDashboard size={16} />, exact: true },
  { label: "Users",               href: "/admin/users",       icon: <Users size={16} /> },
  { label: "Packages",            href: "/admin/packages",    icon: <Package size={16} /> },
  { label: "Withdrawal Requests", href: "/admin/withdrawals", icon: <History size={16} /> },
  { label: "Deposit Requests",    href: "/admin/deposits",    icon: <ArrowDownToLine size={16} /> },
    { label: "Investments", href: "/admin/investments", icon: <TrendingUp size={16} /> },
    
  { label: "Messages", href: "/admin/messages", icon: <Mail size={16} />},

  { label: "Profile",             href: "/admin/profile",     icon: <Settings size={16} /> },
 
];

interface Props { children: React.ReactNode; variant: "user" | "admin"; }

export function DashLayout({ children, variant }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const nav      = variant === "admin" ? ADMIN_NAV : USER_NAV;
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const logout = () => {
    removeUser();
    toast.success("Logged out.");
    router.push("/");
  };

  // ── Fixed isActive: exact match for items marked exact, otherwise prefix match
  // But prefix match must be exact-segment — "/admin" must NOT match "/admin/users"
  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    // prefix match only on full path segments to avoid "/admin" matching "/admin/users"
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const NavLinks = () => (
    <>
      <p className="text-[9px] font-bold tracking-[2px] uppercase text-[var(--muted)] px-3 mb-2 mt-1">Menu</p>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isActive(item)
              ? "bg-[var(--gold-glow)] text-[var(--gold)]"
              : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg-3)]"
          }`}
        >
          {item.icon}
          <span className="flex-1 leading-none">{item.label}</span>
          {isActive(item) && <ChevronRight size={11} className="opacity-50 shrink-0" />}
        </Link>
      ))}
    </>
  );

  const Brand = () => (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-2)] flex items-center justify-center shrink-0">
        <TrendingUp size={13} className="text-black" />
      </div>
      <div>
        <p className="font-display font-bold text-xs tracking-wider text-gold-grad">WEALTMENT</p>
        <p className="text-[10px] text-[var(--muted)]">
          {variant === "admin" ? "Admin Panel" : "Member Portal"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 bg-[var(--bg)]">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed top-16 left-0 bottom-0 w-60 bg-[var(--bg-2)] border-r border-[var(--border)] z-40 overflow-y-auto">
        <div className="px-5 py-4 border-b border-[var(--border)]"><Brand /></div>
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto"><NavLinks /></nav>
        <div className="px-3 py-3 border-t border-[var(--border)]">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--red)] hover:bg-[rgba(248,113,113,0.08)] transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-[var(--bg-2)] border-r border-[var(--border)] z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <Brand />
          <button onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg bg-[var(--bg-3)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)]">
            <X size={14} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto"><NavLinks /></nav>
        <div className="px-3 py-3 border-t border-[var(--border)]">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--red)] hover:bg-[rgba(248,113,113,0.08)] transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="lg:ml-60 min-h-screen flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-16 z-30 bg-[var(--bg-2)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
            aria-label="Open menu"
          >
            <Menu size={17} />
          </button>
          <Brand />
          <span className="ml-auto text-xs text-[var(--muted)] truncate max-w-[120px]">
            {nav.find((n) => isActive(n))?.label ?? ""}
          </span>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
