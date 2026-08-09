import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Info, LogOut, Pencil, Plus, Presentation, Search } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { CollectionAdd } from "@/components/collection-add";
import { CollectionRename } from "@/components/collection-rename";
import { SongDelete } from "@/components/song-delete";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCollections } from "@/lib/collections";
import { DEFAULT_COLLECTION, collectionOf, pickCollection } from "@/lib/song";
import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS } from "@/lib/catalog";
import { countByCollection, getSongs, usingDemoSongs } from "@/lib/songs";
import { songNumber } from "@/lib/song-text";
import { CONTAINER, SWITCH, TAB } from "@/lib/ui";
import type { AdminPageProps } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [params, collections] = await Promise.all([searchParams, getCollections()]);
  const wanted = pickCollection(collections, params.katalog);
  const active = collectionOf(collections, wanted);
  const query = params.q?.trim() || "";
  const limit = PER_PAGE_OPTIONS.includes(Number(params.per)) ? Number(params.per) : DEFAULT_PER_PAGE;
  const page = Math.max(1, Number(params.page) || 1);
  const [{ songs, total }, counts] = await Promise.all([
    getSongs(query, page, limit, wanted, true),
    countByCollection(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const notice = params.deleted
    ? "Lagu telah dihapus."
    : params.renamed
      ? "Nama katalog telah diganti."
      : params.added
        ? "Katalog baru telah dibuat."
        : params.duplikat
          ? "Katalog dengan nama itu sudah ada."
          : params.saved
            ? "Lagu telah disimpan."
            : "";
  const adminUrl = (target: number, katalog = wanted, per = limit) => {
    const next = new URLSearchParams();
    if (katalog !== DEFAULT_COLLECTION) next.set("katalog", katalog);
    if (query) next.set("q", query);
    if (per !== DEFAULT_PER_PAGE) next.set("per", String(per));
    if (target > 1) next.set("page", String(target));
    const search = next.toString();
    return `/admin${search ? `?${search}` : ""}`;
  };

  return (
    <main className="min-h-screen bg-ground">
      <header className="sticky top-0 z-30 border-b border-line bg-ground/90 backdrop-blur-md">
        <div className={`${CONTAINER} flex h-16 items-center justify-between`}>
          <Link href="/admin" className="inline-flex items-center gap-2.5 font-heading text-sm font-bold">
            <Image className="size-8 flex-none rounded-lg object-contain" src="/lagusion.png" width={1254} height={1254} alt="" />
            <span className="max-mobile:hidden">Lagu Sion Edisi Lengkap</span>
            <Badge variant="secondary" className="font-mono text-[10px] uppercase">Admin</Badge>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ExternalLink /> <span className="max-mobile:hidden">Lihat situs</span>
              </Link>
            </Button>
            <form action={logoutAction}>
              <Button variant="outline" size="icon" title="Keluar" aria-label="Keluar"><LogOut /></Button>
            </form>
          </div>
        </div>
      </header>

      <section className={`${CONTAINER} pb-24 pt-10`}>
        <div className="mb-7 flex items-end justify-between gap-6 max-mobile:items-start">
          <div>
            <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-wide text-brand">Content manager</p>
            <h1 className="m-0 font-heading text-3xl font-extrabold leading-tight">Kelola lagu</h1>
            <p className="m-0 mt-2 text-sm text-muted">
              {total} lagu di {active.label}
              {query && ` cocok dengan "${query}"`}
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/lagu/baru"><Plus /> <span className="max-mobile:hidden">Lagu baru</span></Link>
          </Button>
        </div>

        {usingDemoSongs() && (
          <Alert className="mb-5">
            <Info />
            <AlertTitle>Mode demo aktif</AlertTitle>
            <AlertDescription>
              Tambahkan <code className="font-mono text-brand">MONGODB_URI</code> untuk menyimpan perubahan.
            </AlertDescription>
          </Alert>
        )}
        {notice && (
          <Alert className="mb-5">
            <CheckCircle2 />
            <AlertTitle>{notice}</AlertTitle>
          </Alert>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className={SWITCH} role="group" aria-label="Pilih katalog">
            {collections.map((item) => (
              <span key={item.id} className="inline-flex items-center">
                <Link href={adminUrl(1, item.id)} data-active={item.id === wanted} className={TAB}>
                  {item.label}
                  <span className="ml-1.5 text-[10px] font-bold opacity-60">{counts[item.id] || 0}</span>
                </Link>
                {item.id === wanted && !usingDemoSongs() && <CollectionRename collection={item} />}
              </span>
            ))}
            {!usingDemoSongs() && <CollectionAdd />}
          </div>

          <form action="/admin" className="relative flex items-center">
            {wanted !== DEFAULT_COLLECTION && <input type="hidden" name="katalog" value={wanted} />}
            {limit !== DEFAULT_PER_PAGE && <input type="hidden" name="per" value={limit} />}
            <Search size={15} className="pointer-events-none absolute left-3 text-muted" aria-hidden="true" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Cari judul, nomor, lirik"
              aria-label="Cari lagu"
              className="w-64 pl-9 max-mobile:w-44"
            />
          </form>
        </div>


        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <Table>
            <TableHeader className="bg-surface2">
              <TableRow className="hover:bg-transparent">
                {active.numbered && <TableHead className="w-20 pl-4">No.</TableHead>}
                <TableHead className={active.numbered ? "" : "pl-4"}>Judul</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-38 pr-4 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={active.numbered ? 4 : 3} className="py-14 text-center text-muted">
                    {query ? `Tidak ada lagu untuk "${query}".` : "Katalog ini masih kosong."}
                  </TableCell>
                </TableRow>
              )}
              {songs.map((song) => (
                <TableRow key={song.id}>
                  {active.numbered && (
                    <TableCell className="pl-4 font-mono text-xs text-muted">{songNumber(song.number)}</TableCell>
                  )}
                  <TableCell className={active.numbered ? "" : "pl-4"}>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Link
                        href={`/admin/lagu/${song.slug}`}
                        className="truncate text-[15px] font-semibold text-ink hover:text-brand"
                      >
                        {song.title}
                      </Link>
                      <small className="truncate text-dim">{song.artist || song.category || "Tanpa kategori"}</small>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={song.published ? "default" : "secondary"}>
                      {song.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button asChild variant="ghost" size="icon" title="Display">
                        <Link href={`/display/${song.slug}`} aria-label={`Display ${song.title}`}>
                          <Presentation />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" title="Edit">
                        <Link href={`/admin/lagu/${song.slug}`} aria-label={`Edit ${song.title}`}>
                          <Pencil />
                        </Link>
                      </Button>
                      {!usingDemoSongs() && <SongDelete slug={song.slug} title={song.title} />}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted">
          {total > PER_PAGE_OPTIONS[0] && (
            <div className={SWITCH} role="group" aria-label="Jumlah lagu per halaman">
              {PER_PAGE_OPTIONS.filter((option) => option < total).map((option) => (
                <Link key={option} href={adminUrl(1, wanted, option)} data-active={limit === option} className={TAB}>
                  {option}
                </Link>
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav className="ml-auto flex items-center gap-2" aria-label="Halaman daftar lagu">
              {page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={adminUrl(page - 1)}><ChevronLeft /> Sebelumnya</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled><ChevronLeft /> Sebelumnya</Button>
              )}
              <span className="px-1 tabular-nums">{page} / {pageCount}</span>
              {page < pageCount ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={adminUrl(page + 1)}>Berikutnya <ChevronRight /></Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>Berikutnya <ChevronRight /></Button>
              )}
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
