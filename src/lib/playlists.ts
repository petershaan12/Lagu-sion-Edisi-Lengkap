import type { Playlist, SavedSong } from "@/types";

const KEY = "lagusion:playlists";
export const LIKED_ID = "suka";

export const DEFAULT_PLAYLISTS: Playlist[] = [
  { id: LIKED_ID, name: "Disukai", songs: [] },
  {
    id: "sekolah-sabat",
    name: "Sekolah Sabat",
    songs: [
      { slug: "509-dalam-hati", number: 509, title: "Dalam Hati" },
    ],
  },
  {
    id: "khotbah",
    name: "Khotbah",
    songs: [
      { slug: "515-tuhan-ada-dalam-bait-allah", number: 515, title: "Tuhan Ada Dalam Bait Allah" },
      { slug: "1-di-hadapan-hadirat-mu", number: 1, title: "Di Hadapan Hadirat-Mu" },
      { slug: "520-sekarang-ya-tuhan", number: 520, title: "Sekarang Ya Tuhan" },
      { slug: "508-tuhan-b-ri-kami-setia", number: 508, title: "Tuhan, B’ri Kami Setia" },
      { slug: "168-kita-memiliki-pengharapan", number: 168, title: "Kita Memiliki Pengharapan" },
    ],
  },
];

const isPlaylist = (value: unknown): value is Playlist =>
  typeof value === "object" && value !== null && typeof (value as Playlist).id === "string" && Array.isArray((value as Playlist).songs);

export function withDefaults(stored: unknown): Playlist[] {
  const lists = Array.isArray(stored) ? stored.filter(isPlaylist) : [];
  const missing = DEFAULT_PLAYLISTS.filter((base) => !lists.some((list) => list.id === base.id));
  return [...missing, ...lists];
}

export function playlistId(name: string, existing: Playlist[]): string {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "playlist";
  let id = base;
  for (let n = 2; existing.some((list) => list.id === id); n += 1) id = `${base}-${n}`;
  return id;
}

export function hasSong(lists: Playlist[], id: string, slug: string): boolean {
  return Boolean(lists.find((list) => list.id === id)?.songs.some((song) => song.slug === slug));
}

export function toggleSong(lists: Playlist[], id: string, song: SavedSong): Playlist[] {
  return lists.map((list) =>
    list.id !== id
      ? list
      : {
          ...list,
          songs: list.songs.some((item) => item.slug === song.slug)
            ? list.songs.filter((item) => item.slug !== song.slug)
            : [...list.songs, song],
        },
  );
}

export function moveSong(lists: Playlist[], id: string, slug: string, delta: -1 | 1): Playlist[] {
  return lists.map((list) => {
    if (list.id !== id) return list;
    const index = list.songs.findIndex((song) => song.slug === slug);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= list.songs.length) return list;
    const songs = [...list.songs];
    [songs[index], songs[target]] = [songs[target], songs[index]];
    return { ...list, songs };
  });
}

export function removeSong(lists: Playlist[], id: string, slug: string): Playlist[] {
  return lists.map((list) => (list.id === id ? { ...list, songs: list.songs.filter((song) => song.slug !== slug) } : list));
}

export function addPlaylist(lists: Playlist[], name: string): Playlist[] {
  const clean = name.trim();
  if (!clean) return lists;
  return [...lists, { id: playlistId(clean, lists), name: clean, songs: [] }];
}

export function isRemovable(id: string): boolean {
  return !DEFAULT_PLAYLISTS.some((list) => list.id === id);
}

export function removePlaylist(lists: Playlist[], id: string): Playlist[] {
  return isRemovable(id) ? lists.filter((list) => list.id !== id) : lists;
}


let cache: Playlist[] | null = null;
const listeners = new Set<() => void>();

function load(): Playlist[] {
  try {
    return withDefaults(JSON.parse(localStorage.getItem(KEY) || "null"));
  } catch {
    return DEFAULT_PLAYLISTS;
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function snapshot(): Playlist[] {
  return (cache ??= load());
}

export function serverSnapshot(): Playlist[] {
  return DEFAULT_PLAYLISTS;
}

export function save(lists: Playlist[]) {
  cache = lists;
  try {
    localStorage.setItem(KEY, JSON.stringify(lists));
  } catch {
  }
  listeners.forEach((listener) => listener());
}
