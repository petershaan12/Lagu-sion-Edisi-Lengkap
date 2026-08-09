import type { CollectionInfo, SongCollection } from "@/types";

export const DEFAULT_COLLECTION: SongCollection = "sion";

export const COLLECTIONS: CollectionInfo[] = [
  { id: DEFAULT_COLLECTION, label: "Lagu Sion Edisi Lengkap", numbered: true },
  { id: "rohani", label: "Lagu Rohani", numbered: false },
];

export function collectionOf(list: readonly CollectionInfo[], id?: SongCollection): CollectionInfo {
  return list.find((item) => item.id === id) ?? list[0];
}

export function pickCollection(list: readonly CollectionInfo[], value?: string): SongCollection {
  return value && list.some((item) => item.id === value) ? value : (list[0]?.id ?? DEFAULT_COLLECTION);
}
