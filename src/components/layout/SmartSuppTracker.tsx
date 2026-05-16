"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    smartsupp?: (...args: any[]) => void;
  }
}

export default function SmartsuppTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.smartsupp) {
      window.smartsupp("recordPath", pathname);
    }
  }, [pathname]);

  return null;
}