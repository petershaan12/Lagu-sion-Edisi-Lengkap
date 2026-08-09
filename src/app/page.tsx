import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid3x3, List } from "lucide-react";
import { Catalog, CatalogSkeleton, catalogUrl } from "@/components/catalog";
import { InstallPrompt } from "@/components/install-prompt";
import { PlaylistPanel } from "@/components/playlist-panel";
import { SearchBox } from "@/components/search-box";
import { SiteFooter } from "@/components/site-footer";
import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS } from "@/lib/catalog";
import { getCollections } from "@/lib/collections";
import { collectionOf, pickCollection } from "@/lib/song";
import { CONTAINER, SWITCH, TAB } from "@/lib/ui";
import type { CatalogParams, HomeProps } from "@/types";
import { JsonLd } from "@/components/json-ld";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const [raw, collections] = await Promise.all([searchParams, getCollections()]);
  const wanted = pickCollection(collections, raw.katalog);
  const active = collectionOf(collections, wanted);
  const params: CatalogParams = {
    query: raw.q?.trim() || "",
    page: Math.max(1, Number(raw.page) || 1),
    numberView: active.numbered && raw.view === "nomor",
    limit: PER_PAGE_OPTIONS.includes(Number(raw.per)) ? Number(raw.per) : DEFAULT_PER_PAGE,
    songCollection: wanted,
  };
  const { query, numberView, limit, songCollection } = params;
  const currentView = numberView ? "nomor" : "list";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lagu Sion Edisi Lengkap",
    url: siteUrl,
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-ground">
      <main>
        <section className="relative isolate flex min-h-[clamp(400px,52vh,500px)] items-center overflow-hidden bg-[#0b1020] text-white">
          <div className="absolute inset-0 -z-30 bg-[url('/hymnal-hero.png')] bg-cover bg-center max-mobile:bg-position-[62%_center]" />
          <div className="absolute inset-0 -z-20 bg-[#070b16]/80" />
          <div className="absolute -top-52 left-1/2 -z-10 size-160 -translate-x-1/2 rounded-full bg-brand/25 blur-[140px]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-b from-transparent to-ground" />

          <div className="mx-auto flex w-[min(1020px,calc(100%-40px))] flex-col items-center py-10 text-center max-mobile:w-[calc(100%-28px)] max-mobile:py-8">
            <Image
              className="mb-4 size-14 rounded-xl object-contain max-mobile:size-12"
              src="/lagusion.png"
              width={1254}
              height={1254}
              alt="Logo Lagu Sion Edisi Lengkap"
              priority
            />
            <h1 className="m-0 text-balance font-heading text-[clamp(36px,5.5vw,64px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
              Lagu Sion{" "}
              <span className="bg-linear-to-r from-brand via-[#7b96ff] to-brand bg-clip-text text-transparent">Edisi Lengkap</span>
            </h1>
            <p className="mb-6 mt-3.5 max-w-[46ch] text-balance text-base leading-relaxed text-white/70 max-mobile:text-[15px]">
              Butuh <strong className="font-bold text-white">lirik</strong>, <strong className="font-bold text-white">tampilan PPT</strong>,{" "}
              <strong className="font-bold text-white">chord</strong>, atau <strong className="font-bold text-white">audio</strong>?
              Cobain kami di Lagu Sion Edisi Lengkap.
            </p>

            <div className="w-full max-w-155">
              <SearchBox defaultValue={query} view={currentView} per={limit} songCollection={songCollection} />
            </div>
          </div>
        </section>

        <section id="katalog" className={`${CONTAINER} pb-16 pt-9 max-mobile:pt-7`}>
          <InstallPrompt />
          <PlaylistPanel />

          <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className={`${SWITCH} mb-3`} role="group" aria-label="Pilih katalog">
                {collections.map((item) => (
                  <Link
                    key={item.id}
                    href={catalogUrl(params, 1, currentView, limit, item.id)}
                    data-active={item.id === songCollection}
                    className={TAB}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <h2 className="m-0 font-heading text-3xl font-extrabold leading-tight max-mobile:text-[25px]">
                {query ? `Hasil untuk "${query}"` : active.label}
              </h2>
            </div>
            {active.numbered && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                <div className={SWITCH} role="group" aria-label="Pilih tampilan katalog">
                  <Link href={catalogUrl(params, 1, "list")} data-active={!numberView} className={TAB}>
                    <List size={16} aria-hidden="true" /> Daftar
                  </Link>
                  <Link href={catalogUrl(params, 1, "nomor")} data-active={numberView} className={TAB}>
                    <Grid3x3 size={16} aria-hidden="true" /> Nomor
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Suspense key={`${songCollection}|${query}|${params.page}|${currentView}|${limit}`} fallback={<CatalogSkeleton numberView={numberView} limit={limit} />}>
            <Catalog {...params} />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
      <JsonLd data={schema} />
    </div>
  );
}
