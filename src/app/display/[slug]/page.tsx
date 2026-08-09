import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DisplayPlayer } from "@/components/display-player";
import { getAdjacentSlugs, getSongBySlug } from "@/lib/songs";
import { lyricsToDisplaySlides } from "@/lib/song-text";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DisplayPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string; list?: string; arah?: string }>;
}) {
  const [route, query] = await Promise.all([params, searchParams]);
  const song = await getSongBySlug(route.slug);
  if (!song) notFound();
  const showChords = query.mode === "chord" && Boolean(song.chords);
  const adjacent = await getAdjacentSlugs(song);

  return (
    <DisplayPlayer
      key={song.slug}
      title={`${song.title}${showChords ? " - Chord" : ""}`}
      number={song.number}
      slug={`${song.slug}${showChords ? "?view=chord" : ""}`}
      slides={lyricsToDisplaySlides(showChords ? song.chords : song.lyrics)}
      listId={query.list}
      prevSlug={adjacent.previous}
      nextSlug={adjacent.next}
      startAtEnd={query.arah === "mundur"}
    />
  );
}
