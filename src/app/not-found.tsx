import Link from "next/link";
import { Music } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center gap-3 bg-ground px-5 text-muted">
      <div>
        <Music size={34} className="text-brand mb-2" />
        <h1 className="m-0 font-heading text-3xl font-extrabold text-ink">Lagu tidak ditemukan</h1>
        <p className="m-0 mt-3 text-sm">Coba nomor atau kata lain dari judul lagu.</p>
        <Link href="/" className="mt-3 inline-flex border border-primary px-2 py-1 rounded bg-primary/50 items-center gap-2 text-ink hover:text-white">
          Beranda
        </Link>
      </div>
    </main>
  );
}
