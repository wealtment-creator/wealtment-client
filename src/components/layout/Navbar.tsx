"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, TrendingUp } from "lucide-react";
import { getUser, removeUser } from "@/lib/auth";
// import { apiCheckStatus } from "@/lib/api";
import type { User } from "@/types";
import toast from "react-hot-toast";
import Image from "next/image";

const PUBLIC_LINKS = [
  { label: "Home",       href: "/" },
  { label: "About",      href: "/about" },
  { label: "FAQ",        href: "/faq" },
  { label: "Plans",      href: "/plans" },
  { label: "Affiliates", href: "/affiliates" },
  { label: "Contact",    href: "/contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
let logo ="https://i.postimg.cc/VzFr6Zvn/wealtment.jpg"
  // Hydrate user from localStorage
  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  // Token validation every 60 s
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      try {
        // const { valid } = await apiCheckStatus(user.token);
        // if (!valid) {
        //   removeUser();
        //   setUser(null);
        //   toast.error("Session expired. Please log in again.");
        //   router.push("/login");
        // }
      } catch {
        // network error – keep session alive silently
      }
    };
    const iv = setInterval(check, 60_000);
    return () => clearInterval(iv);
  }, [user, router]);

  const logout = () => {
    removeUser();
    setUser(null);
    toast.success("Logged out successfully.");
    router.push("/");
    setOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkCls = (href: string) =>
    `text-xs font-semibold tracking-widest uppercase transition-colors px-3 py-1.5 rounded ${
      isActive(href)
        ? "text-[var(--gold)] bg-[var(--gold-glow)]"
        : "text-[var(--muted-2)] hover:text-[var(--gold)]"
    }`;
console.log('user',user)
let isUser=user?.role=="user"
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--border)] bg-[rgba(6,13,21,0.95)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-2)] flex items-center justify-center overflow-hidden">
            <Image src={logo} alt="wealtment" width={120} height={40} priority />

          </div>
          <span className="font-display font-bold text-sm tracking-wider text-gold-grad hidden sm:block">
            WEALTMENT
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-1">
          {user ? (
            <>
            
            <button className="text-[var(--gold)] bg-[var(--gold-glow)]">
                            <Link  href={isUser?`/user/dashboard`:'/admin'} className={linkCls(`${isUser?'/user/dashboard':'/admin'}`)}>Dashboard</Link>

            </button>
          {isUser&&<Link href="/user/packages" className={linkCls("/user/packages")}>My Packages</Link>}
              {user.isAdmin && (
                <Link href="/admin" className={linkCls("/admin")}>Admin</Link>
              )}
            </>
          ) : (
            PUBLIC_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={linkCls(l.href)}>{l.label}</Link>
            ))
          )}
        </nav>

        {/* Auth buttons */}
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <span className="text-xs text-[var(--muted)] hidden xl:block">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded border border-[var(--border)] text-[var(--muted-2)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded border border-[var(--border)] text-[var(--muted-2)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-xs font-bold tracking-wider uppercase px-5 py-2 rounded bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="lg:hidden text-[var(--muted-2)] p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[var(--bg-2)] border-t border-[var(--border)] px-4 py-4 flex flex-col gap-1">
          {user ? (
            <>
             {isUser&&<>  <MobLink href="/user/dashboard" label="Dashboard" close={() => setOpen(false)} />
              <MobLink href="/user/packages" label="My Packages" close={() => setOpen(false)} /></>}
              {user.isAdmin && <MobLink href="/admin" label="Admin" close={() => setOpen(false)} />}
              <button onClick={logout} className="text-left text-sm py-2 text-[var(--red)] font-semibold">
                Logout
              </button>
            </>
          ) : (
            <>
              {PUBLIC_LINKS.map((l) => (
                <MobLink key={l.href} href={l.href} label={l.label} close={() => setOpen(false)} />
              ))}
              <div className="flex gap-2 pt-2">
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center text-sm py-2 rounded border border-[var(--border)] text-[var(--muted-2)]">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 text-center text-sm py-2 rounded bg-gradient-to-r from-[var(--gold)] to-[var(--gold-2)] text-black font-bold">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function MobLink({ href, label, close }: { href: string; label: string; close: () => void }) {
  return (
    <Link href={href} onClick={close} className="text-sm py-2.5 text-[var(--muted-2)] hover:text-[var(--gold)] font-medium border-b border-[var(--border)] last:border-0 transition-colors">
      {label}
    </Link>
  );
}
