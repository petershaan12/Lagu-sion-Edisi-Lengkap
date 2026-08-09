import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SongForm } from "@/components/song-form";
import { getCollections } from "@/lib/collections";
import { CONTAINER } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function NewSongPage() {
  return (
    <main className="min-h-screen bg-ground">
      <section className={`${CONTAINER} pb-24 pt-9`}>
        <Link href="/admin" className="mb-11 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft size={18} /> Kembali
        </Link>
        <div className="mb-9">
          <p className="m-0 mb-3 text-xs font-extrabold uppercase text-brand">Lagu baru</p>
          <h1 className="m-0 font-heading text-3xl font-extrabold leading-tight">Tambah lagu</h1>
        </div>
        <SongForm collections={await getCollections()} />
      </section>
    </main>
  );
}
