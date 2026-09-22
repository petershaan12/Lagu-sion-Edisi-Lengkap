import type { Filter, Sort, WithId } from "mongodb";
import { getDb, isMongoConfigured } from "@/lib/mongodb";
import { DEFAULT_COLLECTION } from "@/lib/song";
import type { Song, SongCollection, SongInput, SongListResult, SongRecord } from "@/types";

const sampleSongs: Song[] = [
  {
    id: "demo-1",
    collection: "sion",
    artist: "",
    number: 1,
    title: "Kasih-Mu Menuntun",
    slug: "1-kasih-mu-menuntun",
    key: "C",
    timeSignature: "4/4",
    lyrics:
      "Kasih-Mu menuntun langkahku\nDi jalan yang Kau sediakan\nDalam terang firman-Mu\nHatiku teguh berjalan\n\nSaat lembah menjadi kelam\nTangan-Mu tetap menopang\nDamai-Mu tinggal di dalam\nHarapanku tidak hilang\n\nKunyanyikan kasih setia-Mu\nDari pagi sampai malam\nSegala hormat hanya bagi-Mu\nTuhan sumber kehidupan",
    chords:
      "C                 F\nKasih-Mu menuntun langkahku\nAm                G\nDi jalan yang Kau sediakan\nC                 F\nDalam terang firman-Mu\nDm        G         C\nHatiku teguh berjalan\n\nAm                F\nSaat lembah menjadi kelam\nC                 G\nTangan-Mu tetap menopang\nAm                F\nDamai-Mu tinggal di dalam\nDm        G         C\nHarapanku tidak hilang",
    youtubeUrl: "",
    language: "Indonesia",
    category: "Penyembahan",
    published: true,
    createdAt: "2026-08-07T00:00:00.000Z",
    updatedAt: "2026-08-07T00:00:00.000Z",
  },
  {
    id: "demo-2",
    collection: "sion",
    artist: "",
    number: 12,
    title: "Pagi Penuh Anugerah",
    slug: "12-pagi-penuh-anugerah",
    key: "G",
    timeSignature: "3/4",
    lyrics:
      "Pagi penuh anugerah\nMentari menyapa bumi\nKunaikkan syukur pada-Mu\nUntuk nafas hari ini\n\nBimbing pikiran dan langkah\nJadikan hidupku terang\nDi mana pun Kau mengutus\nKusiap melayani-Mu",
    chords: "",
    youtubeUrl: "",
    language: "Indonesia",
    category: "Pagi",
    published: true,
    createdAt: "2026-08-07T00:00:00.000Z",
    updatedAt: "2026-08-07T00:00:00.000Z",
  },
  {
    id: "demo-3",
    collection: "sion",
    artist: "",
    number: 45,
    title: "Damai di Rumah-Mu",
    slug: "45-damai-di-rumah-mu",
    key: "Eb",
    timeSignature: "4/4",
    lyrics:
      "Damai kurasakan di rumah-Mu\nSaat umat datang menyembah\nSatu hati, satu pengharapan\nMemuji nama-Mu selamanya\n\nFirman-Mu menguatkan jiwa\nKasih-Mu memulihkan kami\nUtus kami menjadi berkat\nMembawa damai setiap hari",
    chords:
      "Eb                Ab\nDamai kurasakan di rumah-Mu\nBb                Eb\nSaat umat datang menyembah\nCm                Ab\nSatu hati, satu pengharapan\nFm        Bb        Eb\nMemuji nama-Mu selamanya",
    youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    language: "Indonesia",
    category: "Ibadah",
    published: true,
    createdAt: "2026-08-07T00:00:00.000Z",
    updatedAt: "2026-08-07T00:00:00.000Z",
  },
];

let indexesReady = false;

async function collection() {
  const db = await getDb();
  const songs = db.collection<SongRecord>("songs");

  if (!indexesReady) {
    await Promise.all([
      songs.createIndex({ slug: 1 }, { unique: true }),
      songs.createIndex({ number: 1 }),
      songs.createIndex({ title: 1 }),
    ]);
    indexesReady = true;
  }

  return songs;
}

// _id (ObjectId) must not leak: Song objects cross into Client Components.
function toSong({ _id, ...document }: WithId<SongRecord>): Song {
  return {
    ...document,
    collection: document.collection || DEFAULT_COLLECTION,
    artist: document.artist || "",
    chords: document.chords || "",
    id: _id.toString(),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

function escaped(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getSongs(
  query = "",
  page = 1,
  limit = 60,
  wanted: SongCollection = DEFAULT_COLLECTION,
  includeDrafts = false,
  numbered = wanted === DEFAULT_COLLECTION,
): Promise<SongListResult> {
  if (!isMongoConfigured()) {
    const normalized = query.toLowerCase().trim();
    const matched = sampleSongs.filter(
      (song) =>
        song.collection === wanted &&
        (includeDrafts || song.published) &&
        (!normalized ||
          String(song.number).startsWith(normalized) ||
          song.title.toLowerCase().includes(normalized) ||
          song.artist.toLowerCase().includes(normalized) ||
          song.lyrics.toLowerCase().includes(normalized) ||
          song.chords.toLowerCase().includes(normalized)),
    );
    const from = (Math.max(page, 1) - 1) * limit;
    return { songs: limit ? matched.slice(from, from + limit) : matched, total: matched.length };
  }

  const songs = await collection();
  const search = query.trim();
  const filter: Record<string, unknown> = {
    ...(includeDrafts ? {} : { published: true }),
    ...(wanted === DEFAULT_COLLECTION
      ? { collection: { $in: [wanted, null] } }
      : { collection: wanted }),
  };

  if (search) {
    const regex = new RegExp(escaped(search), "i");
    const isNumber = /^\d+$/.test(search);
    filter.$or = [
      { title: regex },
      { artist: regex },
      { lyrics: regex },
      { chords: regex },
      ...(isNumber
        ? [{ $expr: { $regexMatch: { input: { $toString: "$number" }, regex: `^${search}` } } }]
        : []),
    ];
  }

  const order: Sort = numbered ? { number: 1 } : { title: 1 };

  const [documents, total] = await Promise.all([
    songs
      .find(filter)
      .sort(order)
      .skip((Math.max(page, 1) - 1) * limit)
      .limit(limit)
      .toArray(),
    songs.countDocuments(filter),
  ]);

  return { songs: documents.map(toSong), total };
}

export async function countByCollection(): Promise<Record<SongCollection, number>> {
  const counts: Record<SongCollection, number> = {};
  if (!isMongoConfigured()) {
    for (const song of sampleSongs) counts[song.collection] = (counts[song.collection] || 0) + 1;
    return counts;
  }

  const rows = await (await collection())
    .aggregate<{ _id: SongCollection | null; count: number }>([
      { $group: { _id: "$collection", count: { $sum: 1 } } },
    ])
    .toArray();
  for (const row of rows) {
    const id = row._id ?? DEFAULT_COLLECTION;
    counts[id] = (counts[id] || 0) + row.count;
  }
  return counts;
}

export async function getAllSongs(): Promise<Song[]> {
  if (!isMongoConfigured()) return sampleSongs;
  return (await collection()).find().sort({ number: 1 }).toArray().then((items) => items.map(toSong));
}

export async function getAdjacentSlugs(song: Song, query = ""): Promise<{ previous: string | null; next: string | null }> {
  if (query.trim()) {
    const { songs } = await getSongs(query, 1, 0, song.collection);
    const at = songs.findIndex((item) => item.slug === song.slug);
    return { previous: songs[at - 1]?.slug ?? null, next: at >= 0 ? songs[at + 1]?.slug ?? null : null };
  }
  const byNumber = song.collection === DEFAULT_COLLECTION;

  if (!isMongoConfigured()) {
    const ordered = sampleSongs
      .filter((item) => item.collection === song.collection)
      .sort((a, b) => (byNumber ? a.number - b.number : a.title.localeCompare(b.title)));
    const at = ordered.findIndex((item) => item.slug === song.slug);
    return { previous: ordered[at - 1]?.slug ?? null, next: at >= 0 ? ordered[at + 1]?.slug ?? null : null };
  }

  const songs = await collection();
  const filter = {
    published: true,
    ...(byNumber ? { collection: { $in: [DEFAULT_COLLECTION, null] } } : { collection: song.collection }),
  };
  const field = byNumber ? "number" : "title";
  const value = byNumber ? song.number : song.title;
  const near = (op: "$lt" | "$gt") => ({ ...filter, [field]: { [op]: value } }) as Filter<SongRecord>;
  const [previous, next] = await Promise.all([
    songs.find(near("$lt")).sort({ [field]: -1 }).limit(1).next(),
    songs.find(near("$gt")).sort({ [field]: 1 }).limit(1).next(),
  ]);
  return { previous: previous?.slug ?? null, next: next?.slug ?? null };
}

export async function getSongByNumber(number: number): Promise<Song | null> {
  if (!Number.isInteger(number) || number < 1) return null;
  if (!isMongoConfigured()) {
    return sampleSongs.find((song) => song.number === number) ?? null;
  }

  const document = await (await collection()).findOne({
    number,
    published: true,
    collection: { $in: [DEFAULT_COLLECTION, null] },
  } as Filter<SongRecord>);
  return document ? toSong(document) : null;
}

export async function getSongBySlug(
  slug: string,
  includeDrafts = false,
): Promise<Song | null> {
  if (!isMongoConfigured()) {
    return sampleSongs.find((song) => song.slug === slug) ?? null;
  }

  const document = await (await collection()).findOne({
    slug,
    ...(includeDrafts ? {} : { published: true }),
  });
  return document ? toSong(document) : null;
}

export async function bumpViews(slug: string): Promise<void> {
  if (!isMongoConfigured()) return;
  try {
    await (await collection()).updateOne({ slug }, { $inc: { views: 1 } });
  } catch {
    // View counter is best-effort; never break the song page over it.
  }
}

export async function getPopularSongs(excludeSlug = "", limit = 5): Promise<Song[]> {
  if (!isMongoConfigured()) {
    return sampleSongs.filter((song) => song.slug !== excludeSlug).slice(0, limit);
  }

  const documents = await (await collection())
    .find({ published: true, slug: { $ne: excludeSlug } })
    .sort({ views: -1, number: 1 })
    .limit(limit)
    .toArray();
  return documents.map(toSong);
}

export async function saveSong(input: SongInput, originalSlug = ""): Promise<void> {
  const songs = await collection();
  const now = new Date();

  if (originalSlug) {
    await songs.updateOne(
      { slug: originalSlug },
      { $set: { ...input, updatedAt: now } },
    );
    return;
  }

  await songs.insertOne({ ...input, createdAt: now, updatedAt: now });
}

export async function deleteSong(slug: string): Promise<void> {
  await (await collection()).deleteOne({ slug });
}

export async function getPublishedSongSlugs(): Promise<string[]> {
  if (!isMongoConfigured()) return sampleSongs.map((song) => song.slug);
  const items = await (await collection())
    .find({ published: true }, { projection: { slug: 1 } })
    .toArray();
  return items.map((item) => item.slug);
}

export function usingDemoSongs(): boolean {
  return !isMongoConfigured();
}
