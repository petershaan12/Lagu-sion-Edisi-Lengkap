import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SongNumberGrid } from "@/components/song-number-grid";
import { SongRow } from "@/components/song-row";
import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS } from "@/lib/catalog";
import { DEFAULT_COLLECTION } from "@/lib/song";
import type { CatalogParams, SongCollection } from "@/types";
import { getSongs } from "@/lib/songs";
import { SWITCH, TAB } from "@/lib/ui";

export function catalogUrl(
  { query, limit, songCollection }: CatalogParams,
  target: number,
  view: "list" | "nomor",
  per = limit,
  wanted: SongCollection = songCollection,
) {
  const next = new URLSearchParams();
  if (query) next.set("q", query);
  if (wanted !== DEFAULT_COLLECTION) next.set("katalog", wanted);
  if (target > 1) next.set("page", String(target));
  if (view === "nomor") next.set("view", "nomor");
  if (per !== DEFAULT_PER_PAGE) next.set("per", String(per));
  const search = next.toString();
  return `/${search ? `?${search}` : ""}#katalog`;
}

export function CatalogSkeleton({ numberView, limit }: { numberView: boolean; limit: number }) {
  if (numberView) {
    return (
      <div className="grid animate-pulse grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
        {Array.from({ length: Math.min(limit, 40) }).map((_, index) => (
          <div key={index} className="h-14 rounded-md border border-line bg-surface2" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse border-t border-line">
      {Array.from({ length: Math.min(limit, 10) }).map((_, index) => (
        <div key={index} className="grid min-h-28 grid-cols-[66px_minmax(0,1fr)] items-center gap-5 border-b border-line py-4 pl-3">
          <div className="h-4 w-10 rounded bg-surface2" />
          <div className="flex flex-col gap-2.5">
            <div className="h-4 w-[min(320px,60%)] rounded bg-surface2" />
            <div className="h-3 w-[min(480px,85%)] rounded bg-surface2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PerPageMenu({ params }: { params: CatalogParams }) {
  const { limit, numberView } = params;
  const view = numberView ? "nomor" : "list";

  return (
    <div className={SWITCH} role="group" aria-label="Jumlah lagu per halaman">
      {PER_PAGE_OPTIONS.map((option) => (
        <Link href={catalogUrl(params, 1, view, option)} key={option} data-active={limit === option} className={TAB}>
          {option}
        </Link>
      ))}
    </div>
  );
}

export async function Catalog(params: CatalogParams) {
  const { query, page, numberView, limit, songCollection } = params;
  const { songs, total } = await getSongs(query, numberView ? 1 : page, numberView ? 0 : limit, songCollection);
  const pageCount = numberView ? 1 : Math.ceil(total / limit);
  const pageUrl = (target: number) => catalogUrl(params, target, numberView ? "nomor" : "list");

  if (songs.length === 0) {
    return (
      <div className="border-t border-line px-5 py-17.5 text-center text-muted">
        <h3 className="mb-1 font-heading text-xl font-bold text-ink">
          {query ? `Tidak ada lagu untuk "${query}" 🧐` : "Lagu belum ditemukan 🧐"}
        </h3>
        <p className="m-0">Coba nomor atau kata lain dari judul lagu.</p>
      </div>
    );
  }

  return (
    <>
      {numberView ? (
        <SongNumberGrid songs={songs.map(({ id, slug, number, title }) => ({ id, slug, number, title }))} query={query} />
      ) : (
        <div className="border-t border-line">
          {songs.map((song) => <SongRow song={song} key={song.id} query={query} />)}
        </div>
      )}

      <div className="mt-5 flex min-h-17 flex-wrap items-center justify-between gap-4 text-sm text-muted">
        {numberView ? (
          <span>{total} lagu</span>
        ) : total > PER_PAGE_OPTIONS[0] ? (
          <PerPageMenu params={params} />
        ) : (
          <span />
        )}
        {pageCount > 1 && (
          <nav className="flex items-center gap-5" aria-label="Halaman katalog">
            {page > 1 ? (
              <Link href={pageUrl(page - 1)} className="inline-flex items-center gap-1.5 font-bold text-ink">
                <ChevronLeft size={18} /> Sebelumnya
              </Link>
            ) : <span />}
            <span>{page} / {pageCount}</span>
            {page < pageCount ? (
              <Link href={pageUrl(page + 1)} className="inline-flex items-center gap-1.5 font-bold text-ink">
                Berikutnya <ChevronRight size={18} />
              </Link>
            ) : <span />}
          </nav>
        )}
      </div>
    </>
  );
}
