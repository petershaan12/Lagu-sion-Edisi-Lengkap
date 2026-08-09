import Link from "next/link";
import { ArrowUpRight, Presentation } from "lucide-react";
import type { Song } from "@/types";
import { excerpt, songNumber } from "@/lib/song-text";

export function SongRow({ song }: { song: Song }) {
  return (
    <article className="relative min-h-28 border-b border-line transition-colors hover:bg-surface max-mobile:min-h-33">
      <Link
        href={`/lagu/${song.slug}`}
        className={`grid min-h-28 items-center gap-5 py-4 pl-3 pr-37.5 max-mobile:min-h-33 max-mobile:gap-3 max-mobile:px-3 max-mobile:pb-13.5 max-mobile:pt-3.75 ${
          song.number
            ? "grid-cols-[66px_minmax(0,1fr)_auto_34px] max-mobile:grid-cols-[48px_minmax(0,1fr)]"
            : "grid-cols-[minmax(0,1fr)_auto_34px] max-mobile:grid-cols-[minmax(0,1fr)]"
        }`}
      >
        {song.number > 0 && (
          <span className="font-mono text-sm font-extrabold text-brand">{songNumber(song.number)}</span>
        )}
        <span className="flex min-w-0 flex-col gap-1.75">
          <strong className="text-lg leading-snug max-mobile:text-base">{song.title}</strong>
          {song.artist && <span className="text-[13px] font-semibold text-dim">{song.artist}</span>}
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-muted max-mobile:line-clamp-2 max-mobile:whitespace-normal">
            {excerpt(song.lyrics, 96)}
          </span>
        </span>
        <span className="flex gap-2 text-xs text-muted max-mobile:hidden">
          {song.key && <span className="rounded border border-line px-2 py-1">{song.key}</span>}
          {song.timeSignature && <span className="rounded border border-line px-2 py-1">{song.timeSignature}</span>}
        </span>
        <ArrowUpRight className="text-dim max-mobile:hidden" size={20} aria-hidden="true" />
      </Link>
      <Link
        href={`/display/${song.slug}`}
        aria-label={`Tampilkan ${song.title} sebagai slide`}
        className={`absolute right-3 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-2 rounded-md border border-line px-3.25 text-[13px] font-bold text-ink transition-colors hover:border-brand hover:text-brand max-mobile:bottom-2.75 max-mobile:right-auto max-mobile:top-auto max-mobile:h-8.5 max-mobile:translate-y-0 ${
          song.number ? "max-mobile:left-18" : "max-mobile:left-3"
        }`}
      >
        <Presentation size={18} />
        <span>Display</span>
      </Link>
    </article>
  );
}
