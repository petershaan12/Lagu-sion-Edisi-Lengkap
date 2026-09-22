"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Search, X, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DEFAULT_PER_PAGE } from "@/lib/catalog";
import { DEFAULT_COLLECTION } from "@/lib/song";
import type { SearchBoxProps } from "@/types";

type Result = { slug: string; number: number; title: string; artist: string; hasChords: boolean };

export function SongSearch({ defaultValue = "", view = "list", per = DEFAULT_PER_PAGE, songCollection = DEFAULT_COLLECTION, onSelect, className = "" }: Partial<SearchBoxProps> & { onSelect?: (slug: string) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [numberMode, setNumberMode] = useState(false);
  const query = value.trim();
  const params = new URLSearchParams({ katalog: songCollection });
  if (query) params.set("q", query);
  if (view === "nomor") params.set("view", "nomor");
  if (per !== DEFAULT_PER_PAGE) params.set("per", String(per));

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/songs?${new URLSearchParams({ q: query, katalog: songCollection, limit: "500" })}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Pencarian belum bisa dimuat. Coba lagi.");
        const data = await response.json();
        setResults(data.songs);
        setTotal(data.total);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Pencarian gagal.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, query, songCollection, numberMode]);

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next) { setValue(defaultValue); setResults([]); setLoading(true); setNumberMode(false); } }}>
      <DialogTrigger asChild>
        <button type="button" className={className || "flex min-h-12 w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 text-left text-muted hover:border-brand"}>
          <Search size={20} aria-hidden="true" />
          <span className="flex-1 truncate">{defaultValue || "Cari nomor, judul, atau potongan lirik"}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="z-150 w-[calc(100%-2rem)] max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="px-6 pb-4 pt-6">
          <DialogTitle className="text-2xl font-bold">Cari lagu</DialogTitle>
          {onSelect && <DialogDescription className="mt-2">Pilih lagu untuk disiapkan sebelum ditayangkan.</DialogDescription>}
        </div>
        <div className="mx-6 mb-4 flex items-center gap-3 rounded-lg border border-line bg-ground px-4 focus-within:border-brand">
          {loading ? <LoaderCircle size={24} className="shrink-0 animate-spin text-brand" /> : <Search size={24} className="shrink-0 text-brand" />}
          <input autoFocus aria-label="Cari lagu atau nomor" inputMode="search" maxLength={150} value={value} onChange={(event) => { setValue(event.target.value); setResults([]); setLoading(true); }} placeholder="Nomor, judul, atau lirik…" className="h-11 min-w-0 flex-1 bg-transparent text-base text-ink outline-none" />
          {value && <button type="button" aria-label="Hapus pencarian" className="p-2" onClick={() => { setValue(""); setResults([]); setLoading(true); }}><X size={20} /></button>}
        </div>
        <div className="max-h-[50dvh] min-h-32 overflow-y-auto px-6" aria-busy={loading}>
          {error ? <p role="alert" className="py-4 text-coral">{error}</p> : !loading && results.length === 0 ? <p role="status" className="py-4 text-muted">Tidak ada lagu yang cocok.</p> : numberMode ? <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2 py-3">{results.map((song) => onSelect ? <button type="button" key={song.slug} className="grid h-14 place-items-center rounded-md border border-line bg-surface font-mono text-sm font-bold text-ink hover:border-brand hover:bg-brand hover:text-white" title={song.title} onClick={() => { onSelect(song.slug); setOpen(false); }}>{song.number || "♪"}</button> : <Link key={song.slug} className="grid h-14 place-items-center rounded-md border border-line bg-surface font-mono text-sm font-bold text-ink hover:border-brand hover:bg-brand hover:text-white" title={song.title} href={`/lagu/${song.slug}?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(view === "nomor" ? { dari: "nomor" } : {}) })}`} onClick={() => setOpen(false)}>{song.number || "♪"}</Link>)}</div> : results.map((song) => {
            const content = <><span className="w-12 shrink-0 font-mono text-sm font-bold text-brand">{song.number || "♪"}</span><span className="min-w-0 flex-1"><strong className="block truncate">{song.title}</strong>{song.artist && <span className="text-sm text-muted">{song.artist}</span>}</span>{song.hasChords && <span className="text-xs text-muted">Chord</span>}<ArrowUpRight size={18} /></>;
            const style = "flex w-full items-center gap-3 border-t border-line py-4 text-left text-ink hover:text-brand";
            return onSelect ? <button type="button" key={song.slug} className={style} onClick={() => { onSelect(song.slug); setOpen(false); }}>{content}</button> : <Link key={song.slug} className={style} href={`/lagu/${song.slug}?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(view === "nomor" ? { dari: "nomor" } : {}) })}`} onClick={() => setOpen(false)}>{content}</Link>;
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line bg-ground px-6 py-4 text-sm text-muted">
          <span role="status">{loading ? "Mencari…" : `${total} lagu ditemukan`}</span>
          <span className="flex items-center gap-4">{!onSelect && <Link className="font-semibold text-brand" href={`/?${params}#katalog`} onClick={() => setOpen(false)}>Lihat semua</Link>}<button type="button" className="font-semibold text-brand" onClick={() => setNumberMode((mode) => !mode)}>{numberMode ? "Cari berdasarkan judul" : "Pilih berdasarkan nomor"}</button></span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
