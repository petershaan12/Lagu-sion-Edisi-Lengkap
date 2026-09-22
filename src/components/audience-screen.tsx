"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { connectFirebase } from "@/lib/firebase";
import { isPresentationState, validRoom, type PresentationState } from "@/lib/presentation";
import { lyricsToDisplaySlides } from "@/lib/song-text";
import { PresentationSlide } from "@/components/presentation-slide";
import type { Song } from "@/types";

export function AudienceScreen() {
  const [state, setState] = useState<PresentationState | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Menunggu presenter…");
  const [fullscreen, setFullscreen] = useState(false);
  const [retry, setRetry] = useState(0);
  const [connectionRetry, setConnectionRetry] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.hash.slice(1));
    const room = params.get("room") || "";
    if (!validRoom(room)) {
      queueMicrotask(() => setError("Link tayangan tidak valid. Buka dari tombol Mulai presentasi."));
      return;
    }
    const bus = new BroadcastChannel(`lagusion:${room}`);
    let disposed = false;
    let lastSeen = Date.now();
    let unsubscribe = () => {};
    const accept = (value: unknown) => {
      if (!isPresentationState(value)) return;
      lastSeen = Date.now();
      setStatus("");
      setState((current) => !current || value.updatedAt >= current.updatedAt ? value : current);
    };
    bus.onmessage = (event) => { if (event.data?.type === "state") accept(event.data.state); };
    bus.postMessage({ type: "ready" });
    const heartbeat = setInterval(() => {
      bus.postMessage({ type: "ready" });
      if (params.get("cloud") !== "1" && Date.now() - lastSeen > 8000) setStatus("Koneksi presenter terputus. Tayangan terakhir dipertahankan.");
    }, 2000);
    if (params.get("cloud") === "1") {
      void connectFirebase().then(({ db }) => {
        if (disposed) return;
        unsubscribe = onValue(ref(db, `presentations/${room}`), (snapshot) => {
          const room = snapshot.val();
          if (!room || room.expiresAt < Date.now()) { setState(null); setStatus("Sesi sudah berakhir."); return; }
          accept(room.state);
        }, () => setError("Sesi online tidak bisa dibuka. Minta link baru dari presenter."));
      }).catch(() => { if (!disposed) setError("Koneksi online gagal. Periksa konfigurasi Firebase atau koneksi internet."); });
    }
    const changed = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", changed);
    return () => { disposed = true; clearInterval(heartbeat); bus.close(); unsubscribe(); document.removeEventListener("fullscreenchange", changed); };
  }, [connectionRetry]);

  useEffect(() => {
    if (!state?.slug) return;
    const controller = new AbortController();
    void fetch(`/api/songs?${new URLSearchParams({ slug: state.slug })}`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error();
      const song: Song = await response.json();
      setSong(song);
      setError("");
    }).catch(() => { if (!controller.signal.aborted) setError("Lagu gagal dimuat. Periksa koneksi lalu coba lagi."); });
    return () => controller.abort();
  }, [state?.slug, retry]);

  const slides = song ? lyricsToDisplaySlides(state?.mode === "chord" && song.chords ? song.chords : song.lyrics) : [];
  return (
    <main className="group fixed inset-0 z-100 bg-black text-white">
      {state?.active && song?.slug === state.slug ? <PresentationSlide title={song.title} number={song.number} slide={slides[Math.min(state.index, slides.length - 1)]} index={state.index} total={slides.length} baitCount={Math.max(0, ...slides.map((slide) => slide.bait))} chord={state.mode === "chord" && Boolean(song.chords)} dark={state.dark} blank={state.blank} /> : <div className="grid h-full place-items-center text-center"><p>{state && !state.active ? "Presentasi dihentikan" : status || "Menyiapkan tayangan…"}</p></div>}
      {error && <div role="alert" className="absolute bottom-4 left-4 rounded-lg bg-black/85 p-3 text-sm">{error}<button className="ml-3 underline" onClick={() => { setError(""); setRetry((value) => value + 1); setConnectionRetry((value) => value + 1); }}>Coba lagi</button></div>}
      {!fullscreen && <button type="button" className="absolute right-4 top-4 rounded-lg bg-black/80 px-4 py-3 text-sm text-white" onClick={() => { void document.documentElement.requestFullscreen().catch(() => setError("Layar penuh tidak tersedia. Gunakan tombol layar penuh pada browser.")); }}>Layar penuh</button>}
      {fullscreen && <button type="button" className="absolute right-4 top-4 rounded-lg bg-black/80 px-4 py-3 text-sm text-white opacity-0 focus:opacity-100 group-hover:opacity-100" onClick={() => document.exitFullscreen()}>Keluar layar penuh</button>}
    </main>
  );
}
