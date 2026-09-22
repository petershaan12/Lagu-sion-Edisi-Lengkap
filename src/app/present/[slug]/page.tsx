import { notFound } from "next/navigation";
import { Presenter } from "@/components/presenter";
import { getSongBySlug } from "@/lib/songs";
import { getCollections } from "@/lib/collections";

export const dynamic = "force-dynamic";
export const metadata = { title: "Presenter", robots: { index: false, follow: false } };

export default async function PresenterPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ mode?: string; list?: string }> }) {
  const [route, query, collections] = await Promise.all([params, searchParams, getCollections()]);
  const song = await getSongBySlug(route.slug);
  if (!song) notFound();
  return <Presenter key={song.slug} initialSong={song} initialMode={query.mode === "chord" && song.chords ? "chord" : "lyrics"} initialListId={query.list} collections={collections} />;
}
