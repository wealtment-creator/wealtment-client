import { useState, useEffect, useRef } from "react";

/**
 * Returns the current "page" index that auto-advances every `interval` ms.
 * Use it to slice your data: data.slice(page * size, page * size + size)
 */
export function useAutoScroll(totalItems: number, size: number, interval = 3000) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalItems / size));

  useEffect(() => {
    if (totalItems <= size) return; // nothing to scroll
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, interval);
    return () => clearInterval(timer);
  }, [totalItems, size, totalPages, interval]);

  return { page, totalPages, setPage };
}