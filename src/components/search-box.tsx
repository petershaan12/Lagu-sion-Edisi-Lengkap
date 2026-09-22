"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";
import { DEFAULT_PER_PAGE } from "@/lib/catalog";
import { DEFAULT_COLLECTION } from "@/lib/song";
import type { SearchBoxProps } from "@/types";

export function SearchBox({ defaultValue, view, per, songCollection }: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const query = value.trim();
    if (query === defaultValue) return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams();
      if (query) next.set("q", query);
      if (songCollection !== DEFAULT_COLLECTION) next.set("katalog", songCollection);
      if (view === "nomor") next.set("view", "nomor");
      if (per !== DEFAULT_PER_PAGE) next.set("per", String(per));
      const search = next.toString();
      startTransition(() => router.replace(`/${search ? `?${search}` : ""}#katalog`, { scroll: false }));
    }, 350);
    return () => clearTimeout(timer);
  }, [value, defaultValue, view, per, songCollection, router]);

  return (
    <form action="/" role="search" onSubmit={(event) => event.preventDefault()} className="group grid h-12 w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl bg-white/95 pl-4 pr-2 text-paper-ink shadow-[0_12px_32px_rgb(0_0_0/30%)] backdrop-blur-md transition-shadow focus-within:shadow-[0_12px_32px_rgb(32_79_239/25%)] focus-within:ring-2 focus-within:ring-brand max-mobile:h-11">
      {pending ? <LoaderCircle size={18} className="animate-spin text-brand" /> : <Search size={18} className="text-neutral-400 transition-colors group-focus-within:text-brand" aria-hidden="true" />}
      <input name="q" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Cari nomor, judul, atau potongan lirik" aria-label="Cari lagu" className="h-full min-w-0 border-0 bg-transparent text-[15px] text-paper-ink outline-none placeholder:text-neutral-400" />
      {value ? <button type="button" onClick={() => setValue("")} aria-label="Hapus pencarian" title="Hapus pencarian" className="grid size-8 place-items-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-paper-ink"><X size={17} /></button> : <kbd className="mr-2 hidden rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[11px] font-bold text-neutral-400 min-[680px]:block">ketik nomor / judul</kbd>}
    </form>
  );
}
