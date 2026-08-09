"use client";

import { useEffect } from "react";
import { useOffline } from "next/offline";
import { WifiOff } from "lucide-react";

export function OfflineSupport() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      caches?.keys().then((keys) => keys.forEach((k) => k.startsWith("lagusion-") && caches.delete(k)));
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);

  const isOffline = useOffline();
  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-sm text-ground"
    >
      <WifiOff size={16} /> Mode offline &mdash; hanya lagu yang pernah dibuka.
    </div>
  );
}
