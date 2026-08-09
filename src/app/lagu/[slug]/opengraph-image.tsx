import { getCollections } from "@/lib/collections";
import { OG_CONTENT_TYPE, OG_SIZE, displaySlideImage } from "@/lib/og";
import { collectionOf } from "@/lib/song";
import { songNumber } from "@/lib/song-text";
import { getSongBySlug } from "@/lib/songs";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Lagu Sion Edisi Lengkap";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const song = await getSongBySlug((await params).slug);
  if (!song) return displaySlideImage("Lirik | PPT | Chord | Audio", "Lagu Sion Edisi Lengkap");

  const label = collectionOf(await getCollections(), song.collection).label;
  const title = `${song.number > 0 ? `${songNumber(song.number)} ` : ""}${song.title}`;
  return displaySlideImage(label, title);
}
