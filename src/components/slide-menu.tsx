"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MonitorUp, Music2, Presentation } from "lucide-react";

const OPTION = "flex items-center gap-3 rounded-lg border border-line bg-surface p-4 text-left transition-colors hover:border-brand hover:bg-brand/5";

export function SlideMenu({ slug, hasChords, context = "", compact = false, label = "Tampilkan slide", className }: { slug: string; hasChords: boolean; context?: string; compact?: boolean; label?: string; className?: string }) {
  const suffix = context ? `?${context}` : "";
  const chord = context ? `?${new URLSearchParams(`${context}&mode=chord`)}` : "?mode=chord";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" aria-label="Pilih tampilan" title="Pilih tampilan" className={compact ? "grid size-7 place-items-center rounded text-dim hover:text-brand" : className || "inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 font-heading text-sm font-extrabold text-white transition-colors hover:bg-brand-dark"}>
          <Presentation size={17} /> {!compact && label}
        </button>
      </DialogTrigger>
      <DialogContent className="z-150 max-w-md">
        <DialogTitle>Pilih tampilan</DialogTitle>
        <DialogDescription>Pilih cara lagu ini ditampilkan.</DialogDescription>
        <div className="mt-2 grid gap-2">
          <Link href={`/display/${slug}${suffix}`} className={OPTION}>
            <Presentation className="text-brand" /><span><strong className="block">Slide</strong><small className="text-muted">Tampilan lirik biasa</small></span>
          </Link>
          {hasChords ? <Link href={`/display/${slug}${chord}`} className={OPTION}>
            <Music2 className="text-brand" /><span><strong className="block">Slide Chord</strong><small className="text-muted">Lirik dengan chord</small></span>
          </Link> : <div className={`${OPTION} cursor-not-allowed opacity-45`}><Music2 /><span><strong className="block">Slide Chord</strong><small className="text-muted">Chord belum tersedia</small></span></div>}
          <Link href={`/present/${slug}${context ? `?${context}` : ""}`} className={OPTION}>
            <MonitorUp className="text-brand" /><span><strong className="block">Presentasi</strong><small className="text-muted">Remote dan playlist</small></span>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
