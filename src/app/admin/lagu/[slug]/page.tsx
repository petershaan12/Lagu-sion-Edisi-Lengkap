import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SongForm } from "@/components/song-form";
import { getCollections } from "@/lib/collections";
import { getSongBySlug } from "@/lib/songs";
import { CONTAINER } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function EditSongPage({ params }: { params: Promise<{ slug: string }> }) {
  const [song, collections] = await Promise.all([
    getSongBySlug((await params).slug, true),
    getCollections(),
  ]);
  if (!song) notFound();

  return (
    <main className="min-h-screen bg-ground">
      <section className={`${CONTAINER} pb-24 pt-9`}>
        <Link href="/admin" className="mb-11 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft size={18} /> Kembali
        </Link>
        <div className="mb-9">
          <p className="m-0 mb-3 text-xs font-extrabold uppercase text-brand">Edit lagu</p>
          <h1 className="m-0 font-heading text-3xl font-extrabold leading-tight">{song.title}</h1>
        </div>
        <SongForm song={song} collections={collections} />
      </section>
    </main>
  );
}
