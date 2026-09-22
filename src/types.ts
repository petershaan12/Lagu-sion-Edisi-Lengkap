export type SongCollection = string;

export type CollectionInfo = {
  id: SongCollection;
  label: string;
  numbered: boolean;
};

export type CollectionRecord = {
  _id: SongCollection;
  label: string;
  numbered: boolean;
  order: number;
};

export type Song = {
  id: string;
  collection: SongCollection;
  number: number;
  artist: string;
  title: string;
  slug: string;
  key: string;
  timeSignature: string;
  lyrics: string;
  chords: string;
  youtubeUrl: string;
  language: string;
  category: string;
  published: boolean;
  /** Hit counter for "Sering dilihat"; bumped on every song page view. */
  views?: number;
  createdAt: string;
  updatedAt: string;
};

export type SongInput = Omit<Song, "id" | "createdAt" | "updatedAt">;

export type SongRecord = Omit<Song, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

export type SongListResult = {
  songs: Song[];
  total: number;
};

export type DisplaySlide = {
  text: string;
  reff: boolean;
  bait: number;
};

export type SavedSong = {
  slug: string;
  number: number;
  title: string;
};

export type Playlist = {
  id: string;
  name: string;
  songs: SavedSong[];
};

export type Visited = Record<string, number>;

export type ActionState = { error: string };

export type CatalogParams = {
  query: string;
  page: number;
  numberView: boolean;
  limit: number;
  songCollection: SongCollection;
};

export type GridSong = {
  id: string;
  slug: string;
  number: number;
  title: string;
};

export type SearchBoxProps = {
  defaultValue: string;
  view: "list" | "nomor";
  per: number;
  songCollection: SongCollection;
};

export type DisplayPlayerProps = {
  title: string;
  number: number;
  slug: string;
  slides: DisplaySlide[];
  listId?: string;
  prevSlug?: string | null;
  nextSlug?: string | null;
  startAtEnd?: boolean;
  searchQuery?: string;
  mode?: string;
  fromNomor?: boolean;
};

export type HomeProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    view?: string;
    per?: string;
    katalog?: string;
  }>;
};

export type SongPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string; dari?: string; q?: string }>;
};

export type NumberJumpProps = {
  searchParams: Promise<{ n?: string; ke?: string }>;
};

export type AdminPageProps = {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    renamed?: string;
    added?: string;
    duplikat?: string;
    katalog?: string;
    page?: string;
    q?: string;
    per?: string;
  }>;
};
