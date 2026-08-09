import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpenText, Music2, Presentation } from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { SiteFooter } from "@/components/site-footer";
import { NumberJump } from "@/components/number-jump";
import { VisitTracker } from "@/components/visit-tracker";
import { YoutubeEmbed } from "@/components/youtube-embed";
import { getCollections } from "@/lib/collections";
import { collectionOf } from "@/lib/song";
import { bumpViews, getPopularSongs, getSongBySlug } from "@/lib/songs";
import { excerpt, lyricsToVerses, songNumber } from "@/lib/song-text";
import { CONTAINER, SWITCH, TAB } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/json-ld";
import type { SongPageProps } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SongPageProps): Promise<Metadata> {
  const song = await getSongBySlug((await params).slug);
  if (!song) return { title: "Lagu tidak ditemukan" };

  const album = collectionOf(await getCollections(), song.collection).label;
  const numberPart = song.number ? ` nomor ${song.number},` : "";
  const heading = song.number ? `${album} ${song.number} - ${song.title}` : `${song.title}${song.artist ? ` - ${song.artist}` : ""}`;
  const description = `Lirik dan chord ${album}${numberPart} ${song.title}. ${excerpt(song.lyrics, 120)}`;
  return {
    title: `Lirik ${heading}`,
    description,
    keywords: [
      ...(song.number ? [`${album} ${song.number}`] : [album]),
      song.title,
      `lirik ${song.title}`,
      `chord ${song.title}`,
      ...(song.artist ? [song.artist] : []),
    ],
    alternates: { canonical: `/lagu/${song.slug}` },
    openGraph: { title: heading, description, type: "article" },
  };
}

export default async function SongPage({ params, searchParams }: SongPageProps) {
  const [route, query] = await Promise.all([params, searchParams]);
  const song = await getSongBySlug(route.slug);
  if (!song) notFound();
  const showChords = query.view === "chord" && Boolean(song.chords);
  const fromNomor = query.dari === "nomor";
  const backHref = fromNomor ? "/?view=nomor#katalog" : "/#katalog";
  const dariSuffix = fromNomor ? "&dari=nomor" : "";
  const verses = lyricsToVerses(showChords ? song.chords : song.lyrics);
  const [album, popular] = await Promise.all([
    getCollections().then((list) => collectionOf(list, song.collection)),
    getPopularSongs(song.slug),
    bumpViews(song.slug),
  ]);
  const schema = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    name: song.title,
    alternateName: song.number ? `${album.label} ${song.number} - ${song.title}` : song.title,
    inLanguage: song.language,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/lagu/${song.slug}`,
    isPartOf: { "@type": "MusicAlbum", name: album.label },
    ...(song.artist
      ? { composer: { "@type": "Person", name: song.artist } }
      : album.numbered
        ? { copyrightHolder: { "@type": "Organization", name: "Gereja Masehi Advent Hari Ketujuh" } }
        : {}),
  };

  return (
    <div className="min-h-screen bg-ground">
      <VisitTracker slug={song.slug} />
      <main className={`${CONTAINER} pb-24 pt-11 max-mobile:pt-7.5`}>
        <div className="mb-11 flex items-center justify-between gap-4 max-mobile:mb-7.5">
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
            <ArrowLeft size={18} /> Kembali ke katalog
          </Link>
          <NumberJump />
        </div>

        <header className="flex items-start justify-between gap-6 border-b border-line pb-11 max-mobile:flex-col max-mobile:pb-8">
          <div>
            <p className="m-0 mb-3 font-mono text-[13px] font-extrabold uppercase text-brand">
              {album.label}
              {song.number ? ` ${songNumber(song.number)}` : ""}
            </p>
            <h1 className="m-0 max-w-190 wrap-break-word font-heading text-[54px] font-extrabold leading-[1.08] max-tablet:text-[44px] max-mobile:text-4xl">
              {song.title}
            </h1>
            <div className="mt-5.5 flex flex-wrap items-center gap-4 text-[13px] text-muted">
              {song.artist && <span className="font-semibold text-ink">{song.artist}</span>}
              {song.key && <span className="inline-flex items-center gap-1.75"><Music2 size={16} /> Nada {song.key}</span>}
              {song.timeSignature && <span>{song.timeSignature}</span>}
              {song.category && <span>{song.category}</span>}
              {song.language && <span>{song.language}</span>}
            </div>
          </div>
          <div className="flex flex-none flex-wrap items-center gap-2 max-mobile:w-full">
            <SaveButton song={{ slug: song.slug, number: song.number, title: song.title }} />
            <Link
              href={`/display/${song.slug}${showChords ? "?mode=chord" : ""}`}
              className="inline-flex h-10 flex-none items-center justify-center gap-2 rounded-md bg-brand px-4 font-heading text-sm font-extrabold text-white transition-colors hover:bg-brand-dark max-mobile:w-full"
            >
              <Presentation size={17} /> Tampilkan slide
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,390px)] gap-22 pt-13 max-tablet:grid-cols-1 max-tablet:gap-13 max-mobile:pt-9">
          <article>
            <div className="mb-7 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <BookOpenText size={20} className="text-brand" />
                <h2 className="m-0 font-heading text-3xl font-extrabold leading-tight">{showChords ? "Chord" : "Lirik"}</h2>
              </div>
              {song.chords && (
                <nav className={SWITCH} aria-label="Versi lagu">
                  <Link href={`/lagu/${song.slug}${fromNomor ? "?dari=nomor" : ""}`} data-active={!showChords} className={cn(TAB, "h-7.75 min-w-16")}>Lirik</Link>
                  <Link href={`/lagu/${song.slug}?view=chord${dariSuffix}`} data-active={showChords} className={cn(TAB, "h-7.75 min-w-16")}>Chord</Link>
                </nav>
              )}
            </div>
            {verses.map((verse, index) => (
              <section className="grid grid-cols-[38px_1fr] gap-3.5 border-t border-line py-7" key={`${index}-${verse.text.slice(0, 16)}`}>
                <span className="pt-1.5 font-mono text-xs text-dim">{verse.reff ? "Reff" : String(verse.bait).padStart(2, "0")}</span>
                <p
                  className={
                    showChords
                      ? "m-0 whitespace-pre-wrap font-mono text-[17px] leading-relaxed text-ink"
                      : "m-0 whitespace-pre-line font-serif text-[23px] leading-[1.75] text-ink max-mobile:text-xl"
                  }
                >
                  {verse.text}
                </p>
              </section>
            ))}
          </article>
          {(song.youtubeUrl || popular.length > 0) && (
            <aside className="sticky top-25 flex flex-col gap-10 self-start max-tablet:static max-tablet:max-w-150">
              {song.youtubeUrl && (
                <div>
                  <p className="m-0 mb-3 text-xs font-extrabold uppercase text-brand">Dengarkan</p>
                  <YoutubeEmbed url={song.youtubeUrl} title={song.title} />
                </div>
              )}
              {popular.length > 0 && (
                <div>
                  <p className="m-0 mb-3 text-xs font-extrabold uppercase text-brand">Sering dilihat</p>
                  <ul className="m-0 list-none p-0">
                    {popular.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/lagu/${item.slug}`}
                          className="group flex items-center gap-3 border-b border-line py-3 text-sm"
                        >
                          {item.number > 0 && (
                            <span className="w-9 flex-none font-mono text-xs font-extrabold text-ink">
                              {songNumber(item.number)}
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate font-semibold text-ink group-hover:text-brand">
                            {item.title}
                          </span>
                          <ArrowUpRight size={16} className="flex-none text-dim group-hover:text-brand" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}
        </div>
      </main>
      <SiteFooter />
      <JsonLd data={schema} />
    </div>
  );
}
