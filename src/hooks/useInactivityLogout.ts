"use client";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { removeUser, getUser } from "@/lib/auth";
import toast from "react-hot-toast";

const TIMEOUT_MS = 40_000; // 40 seconds

/**
 * Call this once at the top of your root layout or a shared client component.
 * It listens for any user activity (mouse, keyboard, touch, scroll).
 * After TIMEOUT_MS of silence it logs the user out and redirects to /login.
 */
export function useInactivityLogout() {
  const router  = useRouter();
  const timer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    // Only log out if someone is actually signed in
    if (!getUser()) return;
    removeUser();
    toast.error("You were logged out due to inactivity.");
    router.push("/login");
  }, [router]);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(logout, TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    // Don't attach if no user
    if (!getUser()) return;

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    // Start the timer immediately
    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [reset]);
}
