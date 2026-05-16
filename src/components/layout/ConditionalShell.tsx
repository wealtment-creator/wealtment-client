"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import SmartsuppTracker from "./SmartSuppTracker";
import { useInactivityLogout } from "../../hooks/useInactivityLogout";

const NO_SHELL = ["/login", "/signup", "/forgot-password", "/reset-password", "/user", "/admin"];

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useInactivityLogout()
  const hide = NO_SHELL.some((p) => pathname.startsWith(p));
  if (hide) return <>{children}
  
  </>;
  return (
    <>
      <Navbar />
      <main className="pt-16"> 
        <SmartsuppTracker/>
        {children}</main>
      <Footer />
    </>
  );
}
