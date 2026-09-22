"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp, Heart, ListMusic } from "lucide-react";
import { usePlaylists } from "@/components/save-button";
import { SlideMenu } from "@/components/slide-menu";
import { LIKED_ID, moveSong, save } from "@/lib/playlists";
import { songNumber } from "@/lib/song-text";

const PREVIEW = 5;

export function PlaylistPanel() {
  const lists = usePlaylists();
  const total = lists.reduce((count, list) => count + list.songs.length, 0);

  return (
    <details className="group mb-10 overflow-hidden rounded-xl border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 tra nsition-colors hover:bg-surface2 max-mobile:px-4 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2.5 font-heading text-lg font-extrabold text-ink">
          Playlist saya
          <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-xs font-bold text-muted group-open:bg-brand/10 group-open:text-brand">
            {total} lagu
          </span>
        </span>
        <ChevronDown size={18} className="flex-none text-muted transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-line p-5 max-mobile:p-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
          {lists.map((list) => (
            <section key={list.id} className="flex flex-col rounded-lg border border-line bg-ground">
              <h3 className="m-0 flex items-center gap-2 border-b border-line px-4 py-3 font-heading text-sm font-extrabold text-ink">
                {list.id === LIKED_ID
                  ? <Heart size={15} className="flex-none text-brand" fill="currentColor" />
                  : <ListMusic size={15} className="flex-none text-brand" />}
                <span className="truncate">{list.name}</span>
                <span className="ml-auto flex-none rounded-full bg-surface2 px-2 py-0.5 font-mono text-[11px] font-bold text-muted">
                  {list.songs.length}
                </span>
                {list.songs.length > 0 && (
                  <div className="flex-none">
                    <SlideMenu slug={list.songs[0].slug} hasChords context={`list=${encodeURIComponent(list.id)}`} compact />
                  </div>
                )}
              </h3>

              {list.songs.length === 0 ? (
                <p className="m-0 px-4 py-5 text-[13px] text-muted">Belum ada lagu. Buka lagu lalu tekan Simpan.</p>
              ) : (
                <ul className="m-0 list-none p-1.5">
                  {list.songs.slice(0, PREVIEW).map((song, index) => (
                    <li key={song.slug} className="group/row relative rounded-md transition-colors hover:bg-surface2">
                      <Link href={`/lagu/${song.slug}`} className="flex items-center gap-2.5 py-2 pl-2.5 pr-16">
                        {song.number > 0 && (
                          <span className="w-8 flex-none font-mono text-xs font-extrabold text-brand">
                            {songNumber(song.number)}
                          </span>
                        )}
                        <span className="min-w-0 truncate text-[13px] font-semibold text-ink">{song.title}</span>
                      </Link>
                      <span className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center">
                        <span className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => save(moveSong(lists, list.id, song.slug, -1))}
                            disabled={index === 0}
                            aria-label={`Naikkan ${song.title}`}
                            className="grid h-4 w-6 place-items-center rounded text-dim hover:text-brand disabled:opacity-25 disabled:hover:text-dim"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => save(moveSong(lists, list.id, song.slug, 1))}
                            disabled={index === list.songs.length - 1}
                            aria-label={`Turunkan ${song.title}`}
                            className="grid h-4 w-6 place-items-center rounded text-dim hover:text-brand disabled:opacity-25 disabled:hover:text-dim"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </span>
                        <div className="w-28">
                          <SlideMenu slug={song.slug} hasChords context={`list=${encodeURIComponent(list.id)}`} compact />
                        </div>
                      </span>
                    </li>
                  ))}
                  {list.songs.length > PREVIEW && (
                    <li className="px-2.5 pb-1 pt-1.5 text-xs font-bold text-muted">+{list.songs.length - PREVIEW} lagu lagi</li>
                  )}
                </ul>
              )}
            </section>
          ))}
        </div>

        <Link href="/tersimpan" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink hover:text-brand">
          Kelola & urutkan playlist <ArrowUpRight size={15} />
        </Link>
      </div>
    </details>
  );
}
