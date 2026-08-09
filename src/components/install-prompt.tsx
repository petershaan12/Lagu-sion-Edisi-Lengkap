"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED = "lagusion:install-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

const NO_SUBSCRIBE = () => () => {};

const iosHintNeeded = () => !isStandalone() && !localStorage.getItem(DISMISSED) && isIos();

export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const showIosHint = useSyncExternalStore(NO_SUBSCRIBE, iosHintNeeded, () => false) && !dismissed;

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISSED)) return;

    const onPrompt = (raw: Event) => {
      raw.preventDefault();
      setEvent(raw as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED, "1");
    setEvent(null);
    setDismissed(true);
  }

  async function install() {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
  }

  if (!event && !showIosHint) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 hidden items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-lg max-mobile:flex">
      <Download size={18} className="flex-none text-brand" aria-hidden="true" />
      {event ? (
        <>
          <p className="m-0 min-w-0 flex-1 text-ink">Pasang di layar utama, buka tanpa browser.</p>
          <button
            type="button"
            onClick={install}
            className="inline-flex h-9 flex-none items-center rounded-md bg-brand px-3.5 font-heading text-[13px] font-extrabold text-white hover:bg-brand-dark"
          >
            Pasang
          </button>
        </>
      ) : (
        <p className="m-0 min-w-0 flex-1 text-ink">
          Tambah ke layar utama: ketuk <Share size={15} className="inline align-text-bottom" aria-label="Bagikan" /> Bagikan,
          lalu <SquarePlus size={15} className="inline align-text-bottom" aria-hidden="true" /> Tambah ke Layar Utama.
        </p>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Tutup ajakan pasang aplikasi"
        className="grid size-8 flex-none place-items-center rounded-md text-muted hover:text-brand"
      >
        <X size={16} />
      </button>
    </div>
  );
}
