"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MonitorUp, Radio, Square, EyeOff, Moon, Sun, Minus, Plus } from "lucide-react";
import { get, onDisconnect, onValue, ref, remove, set, type DatabaseReference } from "firebase/database";
import { SongSearch } from "@/components/song-search";
import { SaveButton, usePlaylists } from "@/components/save-button";
import { PresentationSlide } from "@/components/presentation-slide";
import { connectFirebase, firebaseConfigured } from "@/lib/firebase";
import { lyricsToDisplaySlides } from "@/lib/song-text";
import { moveSlide, placeAudienceWindow, type PresentationState, type ScreenDetails } from "@/lib/presentation";
import type { CollectionInfo, Song } from "@/types";

const BUTTON = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink hover:border-brand disabled:opacity-40";

export function Presenter({ initialSong, initialMode, initialListId, collections }: { initialSong: Song; initialMode: "lyrics" | "chord"; initialListId?: string; collections: CollectionInfo[] }) {
  const [liveSong, setLiveSong] = useState(initialSong);
  const [prepared, setPrepared] = useState(initialSong);
  const [preparedMode, setPreparedMode] = useState(initialMode);
  const [collection, setCollection] = useState(initialSong.collection);
  const lists = usePlaylists();
  const [listId, setListId] = useState(initialListId || "");
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<PresentationState>({ slug: initialSong.slug, mode: initialMode, index: 0, blank: false, dark: false, active: true, updatedAt: 1 });
  const latest = useRef(state);
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [catalogAdjacent, setCatalogAdjacent] = useState<{ previous: string | null; next: string | null }>({ previous: null, next: null });
  const channel = useRef<BroadcastChannel | null>(null);
  const cloud = useRef<DatabaseReference | null>(null);
  const selection = useRef<AbortController | null>(null);
  const screenDetails = useRef<ScreenDetails | null>(null);
  const screenPermissionAttempted = useRef(false);
  const playlistSongs = useMemo(() => lists.find((list) => list.id === listId)?.songs ?? [], [lists, listId]);
  const playlistPosition = playlistSongs.findIndex((item) => item.slug === prepared.slug);
  const slides = useMemo(() => lyricsToDisplaySlides(state.mode === "chord" ? liveSong.chords : liveSong.lyrics), [liveSong, state.mode]);
  const preparedSlides = useMemo(() => lyricsToDisplaySlides(preparedMode === "chord" ? prepared.chords : prepared.lyrics), [prepared, preparedMode]);

  useEffect(() => {
    if (listId) return;
    void fetch(`/api/songs?adjacent=${encodeURIComponent(liveSong.slug)}`).then((response) => response.ok ? response.json() : null).then((value) => value && setCatalogAdjacent(value)).catch(() => {});
  }, [liveSong.slug, listId]);

  useEffect(() => {
    if (!resolvedTheme || state.updatedAt !== 1) return;
    const timer = setTimeout(() => setState((current) => ({ ...current, dark: resolvedTheme === "dark" })), 0);
    return () => clearTimeout(timer);
  }, [resolvedTheme, state.updatedAt]);

  const change = useCallback((patch: Partial<PresentationState>) => {
    setState((current) => ({ ...current, ...patch, updatedAt: Math.max(Date.now(), current.updatedAt + 1) }));
  }, []);

  useEffect(() => {
    latest.current = state;
    channel.current?.postMessage({ type: "state", state });
    if (cloud.current) void set(cloud.current, state).catch(() => setError("Sinkronisasi online gagal. Tayangan lokal tetap terhubung."));
  }, [state]);

  useEffect(() => {
    if (!room) return;
    const bus = new BroadcastChannel(`lagusion:${room}`);
    channel.current = bus;
    let lastSeen = 0;
    bus.onmessage = (event) => {
      if (event.data?.type === "ready") {
        lastSeen = Date.now();
        setViewerReady(true);
        bus.postMessage({ type: "state", state: latest.current });
      }
    };
    const heartbeat = setInterval(() => {
      bus.postMessage({ type: "state", state: latest.current });
      setViewerReady(Date.now() - lastSeen < 6000);
    }, 2000);
    const end = () => bus.postMessage({ type: "state", state: { ...latest.current, active: false, updatedAt: Math.max(Date.now(), latest.current.updatedAt + 1) } });
    window.addEventListener("pagehide", end);
    return () => { clearInterval(heartbeat); window.removeEventListener("pagehide", end); end(); bus.close(); channel.current = null; };
  }, [room]);

  useEffect(() => {
    if (!room) return;
    if (!firebaseConfigured) return;
    let disposed = false;
    let roomRef: DatabaseReference | undefined;
    let unsubscribe = () => {};
    void (async () => {
      try {
        const { db, uid } = await connectFirebase();
        if (disposed) return;
        roomRef = ref(db, `presentations/${room}`);
        unsubscribe = onValue(ref(db, ".info/connected"), (snapshot) => setCloudConnected(snapshot.val() === true));
        const offset = Number((await get(ref(db, ".info/serverTimeOffset"))).val()) || 0;
        await set(roomRef, { owner: uid, expiresAt: Date.now() + offset + 12 * 60 * 60 * 1000 - 10000, state: latest.current });
        if (disposed) { await remove(roomRef); return; }
        cloud.current = ref(db, `presentations/${room}/state`);
        await onDisconnect(ref(db, `presentations/${room}/state/active`)).set(false);
        await set(cloud.current, latest.current);
        if (!disposed) setCloudReady(true);
      } catch (cause) {
        if (disposed) return;
        const code = typeof cause === "object" && cause && "code" in cause ? String(cause.code) : "";
        const detail = code === "auth/operation-not-allowed"
          ? "Aktifkan Anonymous sign-in di Firebase Authentication."
          : code === "auth/unauthorized-domain"
            ? "Tambahkan domain production ke Authorized domains Firebase Authentication."
            : code.toLowerCase().includes("permission_denied") || code.toLowerCase().includes("permission-denied")
              ? "Periksa rules Realtime Database untuk sesi presentasi."
              : cause instanceof Error ? cause.message : "Periksa koneksi dan konfigurasi Firebase.";
        setError(`Remote Firebase gagal${code ? ` (${code})` : ""}: ${detail} Layar lokal tetap bisa dipakai.`);
      }
    })();
    return () => { disposed = true; unsubscribe(); cloud.current = null; if (roomRef) void remove(roomRef).catch(() => {}); };
  }, [room]);

  const step = useCallback(async (delta: number) => {
    const atEdge = delta > 0 ? state.index >= slides.length - 1 : state.index <= 0;
    if (!atEdge) {
      setState((current) => ({ ...current, index: moveSlide(current.index, delta, slides.length), updatedAt: Math.max(Date.now(), current.updatedAt + 1) }));
      return;
    }
    const position = playlistSongs.findIndex((item) => item.slug === liveSong.slug);
    const target = listId ? playlistSongs[position + delta]?.slug : delta > 0 ? catalogAdjacent.next : catalogAdjacent.previous;
    if (!target) return;
    const response = await fetch(`/api/songs?slug=${encodeURIComponent(target)}`);
    if (!response.ok) return;
    const song: Song = await response.json();
    setLiveSong(song);
    change({ slug: song.slug, index: delta > 0 ? 0 : lyricsToDisplaySlides(state.mode === "chord" ? song.chords : song.lyrics).length - 1, active: true, blank: false });
  }, [state.index, state.mode, slides.length, playlistSongs, liveSong.slug, listId, catalogAdjacent, change]);

  const jumpSong = useCallback(async (delta: number) => {
    const position = playlistSongs.findIndex((item) => item.slug === liveSong.slug);
    const target = listId ? playlistSongs[position + delta]?.slug : delta > 0 ? catalogAdjacent.next : catalogAdjacent.previous;
    if (!target) return;
    const response = await fetch(`/api/songs?slug=${encodeURIComponent(target)}`);
    if (!response.ok) return;
    const song: Song = await response.json();
    const nextSlides = lyricsToDisplaySlides(state.mode === "chord" ? song.chords : song.lyrics);
    setLiveSong(song);
    change({ slug: song.slug, index: delta > 0 ? 0 : Math.max(0, nextSlides.length - 1), active: true, blank: false });
  }, [playlistSongs, liveSong.slug, listId, catalogAdjacent, state.mode, change]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest("input,textarea,select,button,a,[role=dialog],[contenteditable=true]") || event.altKey || event.ctrlKey || event.metaKey) return;
      if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); step(1); }
      if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); step(-1); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [step]);

  useEffect(() => () => selection.current?.abort(), []);

  async function prepare(slug: string) {
    selection.current?.abort();
    const controller = new AbortController();
    selection.current = controller;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/songs?${new URLSearchParams({ slug })}`, { signal: controller.signal });
      if (!response.ok) throw new Error();
      const song: Song = await response.json();
      setPrepared(song);
      setPreparedMode((mode) => mode === "chord" && song.chords ? "chord" : "lyrics");
    } catch {
      if (!controller.signal.aborted) setError("Lagu gagal dimuat. Coba pilih lagi.");
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }

  async function playPlaylistSong(slug: string) {
    await prepare(slug);
  }

  async function openScreen() {
    if (!firebaseConfigured) setError("Konfigurasi NEXT_PUBLIC_FIREBASE_* tidak masuk ke production build. Atur variabel sebelum build, lalu rebuild dan deploy ulang.");
    const browser = window as Window & { getScreenDetails?: () => Promise<ScreenDetails> };
    if (browser.getScreenDetails && !screenPermissionAttempted.current) {
      screenPermissionAttempted.current = true;
      try {
        screenDetails.current = await browser.getScreenDetails();
        setMessage("Izin layar diberikan. Klik Mulai presentasi sekali lagi untuk membuka layar tayangan.");
      } catch {
        setMessage("Izin layar tidak diberikan atau tidak tersedia. Klik Mulai presentasi lagi untuk membuka tayangan dan pindahkan jendelanya secara manual.");
      }
      return;
    }
    const id = room || crypto.randomUUID();
    const target = window.open(`/present/screen#${new URLSearchParams({ room: id, ...(firebaseConfigured ? { cloud: "1" } : {}) })}`, `lagusion-${id}`, "popup,width=1280,height=720");
    if (!target) { setError("Popup diblokir. Izinkan popup untuk membuka layar tayangan."); return; }
    if (!room) setRoom(id);
    change({ active: true });
    setMessage(placeAudienceWindow(target, screenDetails.current || undefined));
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/present/screen#${new URLSearchParams({ room, cloud: "1" })}`);
      setMessage("Link layar disalin. Buka di perangkat yang akan menampilkan slide.");
    } catch { setError("Link belum bisa disalin. Izinkan akses clipboard lalu coba lagi."); }
  }

  return (
    <main className="min-h-screen bg-ground px-5 py-6 text-ink sm:px-8">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><Link href={`/lagu/${initialSong.slug}`} className="inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink" title="Kembali ke lagu" aria-label="Kembali ke lagu"><ArrowLeft size={20} /></Link><h1 className="m-0 font-heading text-3xl font-bold">Presenter</h1></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`${BUTTON} !bg-brand !text-white`} onClick={openScreen}><MonitorUp size={19} />{room ? "Buka layar tayangan" : "Mulai presentasi"}</button>
          {cloudReady && <button type="button" className={BUTTON} onClick={copyLink}>Salin link layar</button>}
          {room && <button type="button" className={BUTTON} onClick={() => { change({ active: false }); setMessage("Presentasi dihentikan. Layar tayangan menunggu sesi berikutnya."); }}><Square size={16} /> Hentikan</button>}
        </div>
      </header>
      {room && <p role="status" className="mb-4 text-sm text-muted">{viewerReady ? "Layar tayangan terhubung" : "Menunggu layar tayangan"}{firebaseConfigured ? cloudReady && cloudConnected ? " · Online" : " · Menyiapkan koneksi" : " · Dua layar lokal"}</p>}
      {message && <p role="status" className="mb-4 rounded-lg border border-line p-3 text-sm">{message}</p>}
      {error && <p role="alert" className="mb-4 text-coral">{error}</p>}
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-bold"><Radio size={18} className="text-brand" />{room && state.active ? "Sedang tayang" : "Tayangan"}</h2><span className="text-sm text-muted">{state.mode === "chord" ? "Chord" : "Lirik"} · {state.index + 1}/{slides.length}</span></div>
          <div className="aspect-video overflow-hidden rounded-xl border border-line"><PresentationSlide title={liveSong.title} number={liveSong.number} slide={slides[state.index]} index={state.index} total={slides.length} baitCount={Math.max(0, ...slides.map((slide) => slide.bait))} chord={state.mode === "chord"} dark={state.dark} blank={state.blank || !state.active} preview scale={previewScale} /></div>
          <div className="my-4 flex flex-wrap items-center gap-2">
            <button type="button" className={BUTTON} aria-label="Slide sebelumnya" disabled={state.index === 0 && !(listId ? playlistSongs[playlistPosition - 1] : catalogAdjacent.previous)} onClick={() => void step(-1)}><ChevronLeft /></button>
            <button type="button" className={BUTTON} aria-label="Slide berikutnya" disabled={state.index >= slides.length - 1 && !(listId ? playlistSongs[playlistPosition + 1] : catalogAdjacent.next)} onClick={() => void step(1)}><ChevronRight /></button>
            <button type="button" className={BUTTON} aria-label="Lagu sebelumnya" title="Lagu sebelumnya" disabled={!((listId ? playlistSongs[playlistPosition - 1] : catalogAdjacent.previous))} onClick={() => void jumpSong(-1)}><ChevronsLeft /></button>
            <button type="button" className={BUTTON} aria-label="Lagu berikutnya" title="Lagu berikutnya" disabled={!((listId ? playlistSongs[playlistPosition + 1] : catalogAdjacent.next))} onClick={() => void jumpSong(1)}><ChevronsRight /></button>
            <button type="button" className={BUTTON} aria-pressed={state.blank} onClick={() => change({ blank: !state.blank })}><EyeOff size={18} />{state.blank ? "Tampilkan lagi" : "Gelapkan layar"}</button>
            <button type="button" className={BUTTON} onClick={() => change({ dark: !state.dark })} aria-label={state.dark ? "Gunakan latar terang" : "Gunakan latar gelap"} title={state.dark ? "Latar terang" : "Latar gelap"}>{state.dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button type="button" className={BUTTON} onClick={() => setPreviewScale((value) => Math.max(0.75, value - 0.1))} aria-label="Perkecil teks preview" title="Perkecil teks preview"><Minus size={18} /></button>
            <button type="button" className={BUTTON} onClick={() => setPreviewScale((value) => Math.min(1.25, value + 0.1))} aria-label="Perbesar teks preview" title="Perbesar teks preview"><Plus size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Pilih slide yang ditayangkan">
            {slides.map((slide, index) => <button type="button" key={index} aria-current={index === state.index ? "step" : undefined} onClick={() => change({ index })} className={`rounded-lg border p-3 text-left ${index === state.index ? "border-brand bg-brand/10" : "border-line bg-surface"}`}><span className="text-xs font-bold text-brand">{index + 1} · {slide.reff ? "Reff" : `Bait ${slide.bait}`}</span><span className={`mt-2 line-clamp-3 whitespace-pre-wrap text-sm ${state.mode === "chord" ? "font-mono" : ""}`}>{slide.text}</span></button>)}
          </div>
        </section>
        <aside className="min-w-0 rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="m-0 text-lg font-bold">Antrean tayangan</h2><p className="mt-1 text-sm text-muted">Pilih lagu, lalu tayangkan saat siap.</p></div><Radio size={20} className="mt-1 text-brand" /></div>
          <label className="mb-3 block text-sm">Katalog<select className="mt-1 h-11 w-full rounded-lg border border-line bg-ground px-2" value={collection} onChange={(event) => setCollection(event.target.value)}>{collections.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          {lists.length > 0 && <label className="mb-3 block text-sm">Playlist<select className="mt-1 h-11 w-full rounded-lg border border-line bg-ground px-2" value={listId} onChange={(event) => setListId(event.target.value)}><option value="">Tidak memakai playlist</option>{lists.map((list) => <option key={list.id} value={list.id}>{list.name} ({list.songs.length})</option>)}</select></label>}
          {listId && playlistSongs.length ? <div className="mb-4 rounded-lg border border-line bg-ground p-3"><div className="mb-2 flex items-center justify-between gap-2"><p className="m-0 text-xs font-bold uppercase text-muted">Urutan playlist</p><span className="text-xs text-muted">{playlistPosition >= 0 ? `${playlistPosition + 1}/${playlistSongs.length}` : ""}</span></div><div className="mb-2 flex gap-2"><button type="button" className={`${BUTTON} min-h-9 flex-1 px-2`} disabled={playlistPosition <= 0} onClick={() => void playPlaylistSong(playlistSongs[playlistPosition - 1].slug)}>‹ Sebelumnya</button><button type="button" className={`${BUTTON} min-h-9 flex-1 px-2`} disabled={playlistPosition < 0 || playlistPosition >= playlistSongs.length - 1} onClick={() => void playPlaylistSong(playlistSongs[playlistPosition + 1].slug)}>Berikutnya ›</button></div><div className="max-h-40 overflow-auto rounded-md border border-line bg-surface p-1">{playlistSongs.map((item) => <button type="button" key={item.slug} onClick={() => void playPlaylistSong(item.slug)} className={`block w-full truncate rounded px-2.5 py-2 text-left text-sm ${item.slug === prepared.slug ? "bg-brand/10 font-bold text-brand" : "hover:bg-ground"}`}>{item.number > 0 ? `${item.number}. ` : ""}{item.title}</button>)}</div></div> : null}
          <SongSearch songCollection={collection} onSelect={prepare} />
          <div className="mt-5 flex items-center justify-between gap-3"><p className="m-0 min-w-0 truncate font-bold">{prepared.number > 0 ? `${prepared.number}. ` : ""}{prepared.title}</p><SaveButton song={{ slug: prepared.slug, number: prepared.number, title: prepared.title }} /></div>
          <div className="my-3 flex gap-2" role="group" aria-label="Versi untuk ditayangkan">
            <button type="button" className={BUTTON} aria-pressed={preparedMode === "lyrics"} onClick={() => setPreparedMode("lyrics")}>Lirik</button>
            <button type="button" className={BUTTON} aria-pressed={preparedMode === "chord"} disabled={!prepared.chords} onClick={() => setPreparedMode("chord")}>Chord</button>
          </div>
          {!prepared.chords && <p className="mb-3 text-xs text-muted">Chord belum tersedia untuk lagu ini.</p>}
          <div className="mb-4 max-h-64 overflow-auto rounded-lg bg-ground p-3"><p className={`whitespace-pre-wrap text-sm ${preparedMode === "chord" ? "font-mono" : ""}`}>{preparedSlides[0]?.text}</p></div>
          <button type="button" disabled={loading || !preparedSlides.length} className={`${BUTTON} w-full !bg-brand !text-white`} onClick={() => { setLiveSong(prepared); change({ slug: prepared.slug, mode: preparedMode, index: 0, blank: false, active: true }); }}>{loading ? "Memuat…" : "Tayangkan lagu ini"}</button>
        </aside>
      </div>
    </main>
  );
}
