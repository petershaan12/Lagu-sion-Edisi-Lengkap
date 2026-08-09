"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Heart, ListPlus, Plus } from "lucide-react";
import {
  LIKED_ID,
  addPlaylist,
  hasSong,
  playlistId,
  save,
  serverSnapshot,
  snapshot,
  subscribe,
  toggleSong,
} from "@/lib/playlists";
import type { SavedSong } from "@/types";

export function usePlaylists() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

const BTN =
  "inline-flex h-10 flex-none items-center justify-center gap-2 rounded-md border border-line px-3.5 font-heading text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand";

function useDismiss(ref: React.RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    const close = (event: Event) => {
      const menu = ref.current;
      if (!menu?.open) return;
      if (event.type === "pointerdown" && menu.contains(event.target as Node)) return;
      if (event.type === "keydown" && (event as KeyboardEvent).key !== "Escape") return;
      menu.open = false;
    };

    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [ref]);
}

export function SaveButton({ song }: { song: SavedSong }) {
  const lists = usePlaylists();
  const [name, setName] = useState("");
  const menu = useRef<HTMLDetailsElement>(null);
  useDismiss(menu);
  const liked = hasSong(lists, LIKED_ID, song.slug);
  const savedCount = lists.filter((list) => list.id !== LIKED_ID && hasSong(lists, list.id, song.slug)).length;

  return (
    <div className="flex flex-none items-center gap-2 max-mobile:w-full">
      <button
        type="button"
        onClick={() => save(toggleSong(lists, LIKED_ID, song))}
        aria-pressed={liked}
        aria-label={liked ? "Hapus dari Disukai" : "Sukai lagu ini"}
        className={`${BTN} ${liked ? "border-brand text-brand" : ""} w-12 px-0`}
      >
        <Heart size={30} fill={liked ? "currentColor" : "none"} />
      </button>

      <details ref={menu} className="relative max-mobile:flex-1">
        <summary className={`${BTN} cursor-pointer list-none max-mobile:w-full [&::-webkit-details-marker]:hidden`}>
          <ListPlus size={17} /> Simpan{savedCount > 0 ? ` (${savedCount})` : ""}
        </summary>
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-md border border-line bg-ground p-2 shadow-lg max-mobile:left-0">
          <ul className="m-0 list-none p-0">
            {lists.map((list) => {
              const active = hasSong(lists, list.id, song.slug);
              return (
                <li key={list.id}>
                  <button
                    type="button"
                    onClick={() => save(toggleSong(lists, list.id, song))}
                    className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-sm font-semibold text-ink hover:bg-surface"
                  >
                    <span className="truncate">{list.name}</span>
                    {active && <Check size={16} className="flex-none text-brand" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <form
            className="mt-2 flex gap-1.5 border-t border-line pt-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              const next = addPlaylist(lists, name);
              save(toggleSong(next, playlistId(name.trim(), lists), song));
              setName("");
            }}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Playlist baru"
              className="h-9 min-w-0 flex-1 rounded border border-line bg-surface px-2.5 text-sm text-ink outline-none focus:border-brand"
            />
            <button type="submit" aria-label="Buat playlist" className="grid h-9 w-9 flex-none place-items-center rounded bg-brand text-white">
              <Plus size={16} />
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
