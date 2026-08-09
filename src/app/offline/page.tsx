import Link from "next/link";
import { ArrowLeft, WifiOff } from "lucide-react";

export const metadata = { title: "Tidak ada koneksi" };

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center gap-3 bg-ground px-5 text-center text-muted">
      <div>
        <WifiOff size={34} className="mx-auto text-brand" />
        <p className="mb-3 mt-4 text-xs font-extrabold uppercase text-brand">Offline</p>
        <h1 className="m-0 font-heading text-4xl font-extrabold text-ink">Lagu ini belum tersimpan</h1>
        <p className="mx-auto mt-3 max-w-md">Buka lagu ini sekali saat ada internet, lalu bisa dibuka lagi tanpa koneksi.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 font-semibold text-ink hover:text-brand">
          <ArrowLeft size={18} /> Kembali ke katalog
        </Link>
      </div>
    </main>
  );
}
