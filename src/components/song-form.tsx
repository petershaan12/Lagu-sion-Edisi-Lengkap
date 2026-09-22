"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import { Eye, LoaderCircle, Save } from "lucide-react";
import { saveSongAction } from "@/app/admin/actions";
import { DEFAULT_COLLECTION, collectionOf } from "@/lib/song";
import type { CollectionInfo, Song, SongCollection } from "@/types";
import { joinReff, lyricsToDisplaySlides, songNumber, splitReff } from "@/lib/song-text";
import { TAB as BASE_TAB } from "@/lib/ui";
import { cn } from "@/lib/utils";

const initialState = { error: "" };

const LABEL = "block text-xs font-bold text-muted";
const FIELD = "mt-2 min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-ink outline-none focus:border-brand";
const AREA = `${FIELD} min-h-90 resize-y font-mono text-sm leading-relaxed`;
const TAB = cn(BASE_TAB, "h-6.75 gap-0 text-[10px]");

export function SongForm({ song, collections }: { song?: Song; collections: CollectionInfo[] }) {
  const [initial] = useState(() => splitReff(song?.lyrics || ""));
  const [lyrics, setLyrics] = useState(initial.verses);
  const [reff, setReff] = useState(initial.reff);
  const [hasReff, setHasReff] = useState(Boolean(initial.reff));
  const [chords, setChords] = useState(song?.chords || "");
  const [title, setTitle] = useState(song?.title || "");
  const [number, setNumber] = useState(song?.number ? String(song.number) : "");
  const [previewMode, setPreviewMode] = useState<"lyrics" | "chords">("lyrics");
  const [songCollection, setSongCollection] = useState<SongCollection>(song?.collection || DEFAULT_COLLECTION);
  const numbered = collectionOf(collections, songCollection).numbered;
  const [state, action, pending] = useActionState(saveSongAction, initialState);
  const fullLyrics = useMemo(() => (hasReff ? joinReff(lyrics, reff) : lyrics.trim()), [hasReff, lyrics, reff]);
  const slides = useMemo(
    () => lyricsToDisplaySlides(previewMode === "chords" ? chords : fullLyrics),
    [chords, fullLyrics, previewMode],
  );
  const baitCount = useMemo(() => Math.max(0, ...slides.map((slide) => slide.bait)), [slides]);

  return (
    <form action={action}>
      <input type="hidden" name="originalSlug" value={song?.slug || ""} />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-11 max-tablet:grid-cols-1">
        <section className="flex flex-col gap-4.5">
          <label className={LABEL}>
            Katalog
            <select
              name="collection"
              value={songCollection}
              onChange={(event) => setSongCollection(event.target.value as SongCollection)}
              className={FIELD}
            >
              {collections.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3.5 max-mobile:grid-cols-1">
            {numbered && (
              <label className={LABEL}>
                Nomor
                <input
                  name="number"
                  type="number"
                  min="1"
                  required
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  className={FIELD}
                />
              </label>
            )}
            <label className={`${LABEL} ${numbered ? "" : "col-span-full"}`}>
              Judul
              <input name="title" required value={title} onChange={(event) => setTitle(event.target.value)} className={FIELD} />
            </label>
          </div>

          <label className={LABEL}>
            Pembuat lagu
            <input name="artist" defaultValue={song?.artist} placeholder="Nama pencipta atau pembawa lagu" className={FIELD} />
          </label>

          <div className="grid grid-cols-3 gap-3.5 max-mobile:grid-cols-1">
            <label className={LABEL}>
              Nada dasar
              <input name="key" defaultValue={song?.key} placeholder="C" className={FIELD} />
            </label>
            <label className={LABEL}>
              Birama
              <input name="timeSignature" defaultValue={song?.timeSignature} placeholder="4/4" className={FIELD} />
            </label>
            <label className={LABEL}>
              Bahasa
              <input name="language" defaultValue={song?.language || "Indonesia"} className={FIELD} />
            </label>
          </div>

          <label className={LABEL}>
            Kategori
            <input name="category" defaultValue={song?.category} placeholder="Penyembahan" className={FIELD} />
          </label>

          <label className={LABEL}>
            Link YouTube
            <input name="youtubeUrl" type="url" defaultValue={song?.youtubeUrl} placeholder="https://youtube.com/watch?v=..." className={FIELD} />
          </label>

          <label className={LABEL}>
            Lirik per bait
            <textarea
              required
              rows={18}
              value={lyrics}
              onChange={(event) => setLyrics(event.target.value)}
              placeholder={"Baris pertama\nBaris kedua\n\nBait berikutnya"}
              className={AREA}
            />
          </label>
          {/* What actually gets saved: baits plus the reff woven in as a "Reff:" block. */}
          <input type="hidden" name="lyrics" value={fullLyrics} />

          <label className="flex cursor-pointer items-center gap-2.5 text-ink">
            <input
              type="checkbox"
              checked={hasReff}
              onChange={(event) => setHasReff(event.target.checked)}
              className="size-4.5 accent-brand"
            />
            <span>Lagu punya reff</span>
          </label>
          {hasReff && (
            <label className={LABEL}>
              Reff
              <textarea
                rows={8}
                value={reff}
                onChange={(event) => setReff(event.target.value)}
                placeholder={"Baris reff pertama\nBaris reff kedua"}
                className={`${AREA} min-h-40`}
              />
            </label>
          )}

          <label className={LABEL}>
            Versi chord
            <textarea
              name="chords"
              rows={18}
              value={chords}
              onChange={(event) => setChords(event.target.value)}
              placeholder={"C                 F\nBaris lirik dengan chord\n\nAm                G\nBait berikutnya"}
              className={AREA}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2.5 text-ink">
            <input name="published" type="checkbox" defaultChecked={song?.published ?? true} className="size-4.5 accent-brand" />
            <span>Publikasikan lagu</span>
          </label>

          {state.error && <p className="m-0 text-[13px] text-coral" role="alert">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 font-heading text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}
            Simpan lagu
          </button>
        </section>

        <aside className="sticky top-6 max-tablet:static">
          <div className="mb-3.5 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.75 font-bold"><Eye size={17} /> Preview slide</span>
            <div className="ml-auto inline-flex rounded-md border border-line bg-surface2 p-0.5" aria-label="Jenis preview">
              <button type="button" data-active={previewMode === "lyrics"} className={TAB} onClick={() => setPreviewMode("lyrics")}>Lirik</button>
              <button type="button" data-active={previewMode === "chords"} className={TAB} onClick={() => setPreviewMode("chords")}>Chord</button>
            </div>
          </div>
          <div className="flex max-h-180 flex-col gap-2.5 overflow-auto pr-1 max-tablet:grid max-tablet:max-h-none max-tablet:grid-cols-2 max-mobile:grid-cols-1">
            {slides.map((slide, index) => (
                <div
                  key={`${index}-${slide.text.slice(0, 12)}`}
                  className="relative aspect-video w-full overflow-hidden rounded-md border border-line bg-white text-left text-[#17364a]"
                >
                  <div className="absolute inset-y-0 right-0 w-[16%] overflow-hidden bg-[#25334d] bg-[url('/hymnal-hero.png')] bg-cover bg-position-[72%_center]">
                    <span className="absolute inset-0 bg-brand/55" />
                    <Image
                      className="absolute bottom-[4%] right-[14%] h-auto w-[72%] object-contain brightness-0 invert"
                      src="/advent-logo.png"
                      width={2000}
                      height={1799}
                      alt=""
                    />
                  </div>
                  <div className="absolute left-3 right-[20%] top-2 overflow-hidden text-ellipsis whitespace-nowrap font-heading text-[9px] font-extrabold uppercase text-[#17475a] underline decoration-brand underline-offset-2">
                    {numbered && number ? `${songNumber(Number(number))} ` : ""}{title || "Judul lagu"}
                  </div>
                  <span className="absolute left-3 top-6.5 text-[13px] font-semibold">
                    {slide.reff ? "Reff" : `${slide.bait}/${baitCount}`}
                  </span>
                  <p className={`absolute bottom-4 left-3 right-[20%] top-11.5 m-0 overflow-hidden text-[11px] font-semibold leading-[1.45] ${previewMode === "chords" ? "whitespace-pre-wrap font-mono" : "whitespace-pre-line font-heading"}`}>
                    {slide.text}
                  </p>
                  <span className="absolute bottom-0 left-0 h-0.75 bg-brand" style={{ width: `${((index + 1) / slides.length) * 100}%` }} />
                </div>
            ))}
          </div>
        </aside>
      </div>
    </form>
  );
}
