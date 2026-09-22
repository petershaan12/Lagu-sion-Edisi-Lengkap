"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { recencyRank, serverSnapshot, snapshot, subscribe } from "@/lib/visited";
import { songNumber } from "@/lib/song-text";
import type { GridSong } from "@/types";


const BASE =
  "grid h-14 place-items-center rounded-md border border-line bg-surface font-mono text-sm font-bold transition-colors";

function tone(rank: number | undefined) {
  if (rank === undefined) return "text-ink hover:bg-ink hover:text-surface";
  if (rank < 5) return "border-brand/40 text-brand hover:bg-brand hover:text-white";
  if (rank < 15) return "border-brand/25 text-brand/70 hover:bg-brand hover:text-white";
  return "border-brand/15 text-brand/40 hover:bg-brand hover:text-white";
}

export function SongNumberGrid({ songs, query = "" }: { songs: GridSong[]; query?: string }) {
  const params = new URLSearchParams({ dari: "nomor" });
  if (query) params.set("q", query);
  const visited = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const ranks = useMemo(() => recencyRank(visited), [visited]);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
      {songs.map((song) => (
        <Link href={`/lagu/${song.slug}?${params}`} key={song.id} title={song.title} className={`${BASE} ${tone(ranks[song.slug])}`}>
          {songNumber(song.number)}
        </Link>
      ))}
    </div>
  );
}
