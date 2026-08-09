"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlaylists } from "@/components/save-button";
import { songNumber } from "@/lib/song-text";
import type { DisplayPlayerProps } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Expand,
  Minus,
  Moon,
  Plus,
  Shrink,
  Sun,
  X,
} from "lucide-react";

const RAIL = "[--rail:clamp(150px,13vw,240px)] max-mobile:[--rail:0px]";
const CONTROL_BUTTON =
  "grid size-10.5 place-items-center rounded-md border border-white/15 bg-white/10 text-inherit disabled:opacity-30 max-mobile:size-9.5";
const CONTROL_BUTTON_LIGHT = "border-[#d9dfeb] bg-white text-[#264158]";

export function DisplayPlayer({ title, number, slug, slides, listId, prevSlug, nextSlug, startAtEnd }: DisplayPlayerProps) {
  const [index, setIndex] = useState(startAtEnd ? slides.length - 1 : 0);
  const { resolvedTheme, setTheme } = useTheme();
  const light = resolvedTheme !== "dark";
  const [scale, setScale] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const router = useRouter();

  const baitCount = useMemo(() => Math.max(0, ...slides.map((slide) => slide.bait)), [slides]);

  const lists = usePlaylists();
  const songs = (listId && lists.find((list) => list.id === listId)?.songs) || [];
  const position = songs.findIndex((song) => song.slug === slug.split("?")[0]);
  const previousSong = position > 0 ? songs[position - 1].slug : null;
  const nextSong = position >= 0 ? songs[position + 1]?.slug ?? null : null;
  const jumpPrevious = position >= 0 ? previousSong : prevSlug ?? null;
  const jumpNext = position >= 0 ? nextSong : nextSlug ?? null;

  const songHref = useCallback(
    (target: string, back = false) => {
      const query = new URLSearchParams();
      if (listId) query.set("list", listId);
      if (back) query.set("arah", "mundur");
      const params = query.toString();
      return `/display/${target}${params ? `?${params}` : ""}`;
    },
    [listId],
  );

  const previous = useCallback(() => {
    if (index === 0 && previousSong) router.push(songHref(previousSong, true));
    else setIndex(Math.max(0, index - 1));
  }, [index, previousSong, songHref, router]);
  const next = useCallback(() => {
    if (index === slides.length - 1 && nextSong) router.push(songHref(nextSong));
    else setIndex(Math.min(slides.length - 1, index + 1));
  }, [index, slides.length, nextSong, songHref, router]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        next();
      }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        previous();
      }
      if (event.key === "Home") setIndex(0);
      if (event.key === "End") setIndex(slides.length - 1);
    };

    document.addEventListener("keydown", handleKey);
    const handleFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [next, previous, slides.length]);

  const fontSize = useMemo(() => {
    const length = slides[index]?.text.length || 0;
    if (length > 260) return "text-[34px] max-tablet:text-[29px] max-mobile:text-2xl";
    if (length > 150) return "text-[43px] max-tablet:text-4xl max-mobile:text-[29px]";
    return "text-[52px] max-tablet:text-[44px] max-mobile:text-[34px]";
  }, [index, slides]);

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  }

  const button = `${CONTROL_BUTTON} ${light ? CONTROL_BUTTON_LIGHT : ""}`;

  return (
    <main
      className={`fixed inset-0 z-100 overflow-hidden transition-colors ${RAIL} ${
        light ? "bg-white text-[#17364a]" : "bg-[#0c1322] text-[#f6f8ff]"
      }`}
    >
      <div
        className={`absolute inset-x-[4.5%] top-6 z-10 flex h-10.5 items-start justify-between right-[calc(var(--rail)+28px)] max-mobile:inset-x-3.5 max-mobile:top-4.5 max-mobile:h-9.5 ${
          light ? "text-[#17475a]" : "text-[#c9d5ff]"
        }`}
      >
        <strong className="min-w-0 max-w-[min(72vw,980px)] overflow-hidden text-ellipsis whitespace-nowrap font-heading text-lg font-extrabold uppercase leading-snug underline decoration-brand decoration-2 underline-offset-4 max-mobile:max-w-[calc(100vw-78px)] max-mobile:text-[13px]">
          {number > 0 && <span>{songNumber(number)} </span>}{title}
        </strong>
      </div>

      <div className="absolute left-[4.5%] top-19.5 z-5 text-5xl font-semibold leading-none max-mobile:left-[7%] max-mobile:top-17.5 max-mobile:text-[34px]">
        {slides[index]?.reff ? (
          "Reff"
        ) : baitCount > 0 ? (
          `${slides[index]?.bait}/${baitCount}`
        ) : (
          `${index + 1}/${slides.length}`
        )}
      </div>

      <button
        className="absolute bottom-22.5 left-0 top-17.5 z-3 w-[10%] cursor-pointer border-0 bg-transparent p-0"
        onClick={previous}
        aria-label="Slide sebelumnya"
      />
      <section
        className="absolute bottom-23 left-[4.5%] top-39 flex items-start justify-start overflow-hidden text-left right-[calc(var(--rail)+5%)] max-mobile:inset-x-[7%] max-mobile:bottom-23.5 max-mobile:top-30.5"
        aria-live="polite"
      >
        <p
          className={`m-0 max-w-300 origin-top-left whitespace-pre-line wrap-break-word font-heading font-semibold leading-[1.48] transition-transform max-mobile:leading-[1.35] ${fontSize}`}
          style={{ transform: `scale(${scale})` }}
        >
          {slides[index]?.text}
        </p>
      </section>
      <button
        className="absolute bottom-22.5 right-(--rail) top-17.5 z-3 w-[10%] cursor-pointer border-0 bg-transparent p-0"
        onClick={next}
        aria-label="Slide berikutnya"
      />

      <aside className="absolute inset-y-0 right-0 z-6 w-(--rail) overflow-hidden bg-[#25334d] bg-[url('/hymnal-hero.png')] bg-cover bg-position-[72%_center] max-mobile:hidden">
        <span className={`absolute inset-0 z-1 ${light ? "bg-brand/55" : "bg-[#182641]/70"}`} />
        <Image
          className="absolute bottom-[4%] right-[14%] z-2 h-auto w-[72%] object-contain brightness-0 invert"
          src="/advent-logo.png"
          width={2000}
          height={1799}
          alt="Logo Gereja Masehi Advent Hari Ketujuh"
          priority
        />
      </aside>

      <div className="absolute bottom-0 left-0 right-(--rail) z-14 h-0.75 bg-white/10" aria-hidden="true">
        <span
          className="block h-full bg-brand transition-[width] duration-200"
          style={{ width: `${((index + 1) / slides.length) * 100}%` }}
        />
      </div>

      <div
        className={`absolute bottom-5.5 left-[calc((100%-var(--rail))/2)] z-12 flex h-14 -translate-x-1/2 items-center gap-1.5 rounded-lg border p-1.5 shadow-2xl backdrop-blur-md max-mobile:bottom-3 max-mobile:left-1/2 max-mobile:w-[calc(100%-20px)] max-mobile:justify-center ${
          light ? "border-[#d9dfeb] bg-white/95" : "border-white/10 bg-[#121c30]/95"
        }`}
      >
        <button
          className={button}
          onClick={() => jumpPrevious && router.push(songHref(jumpPrevious))}
          disabled={!jumpPrevious}
          title="Lagu sebelumnya"
          aria-label="Lagu sebelumnya"
        >
          <ChevronsLeft size={24} />
        </button>
        <button className={button} onClick={previous} disabled={index === 0 && !previousSong} title="Slide sebelumnya" aria-label="Slide sebelumnya">
          <ChevronLeft size={24} />
        </button>
        <span className="w-15 text-center text-xs font-bold max-mobile:w-12">{index + 1} / {slides.length}</span>
        <button className={button} onClick={next} disabled={index === slides.length - 1 && !nextSong} title="Slide berikutnya" aria-label="Slide berikutnya">
          <ChevronRight size={24} />
        </button>
        <button
          className={button}
          onClick={() => jumpNext && router.push(songHref(jumpNext))}
          disabled={!jumpNext}
          title="Lagu berikutnya"
          aria-label="Lagu berikutnya"
        >
          <ChevronsRight size={24} />
        </button>
        <span className={`mx-0.5 h-6 w-px max-mobile:hidden ${light ? "bg-black/15" : "bg-white/15"}`} />
        <button className={button} onClick={() => setScale((value) => Math.max(0.8, value - 0.1))} title="Perkecil teks" aria-label="Perkecil teks">
          <Minus size={20} />
        </button>
        <button className={button} onClick={() => setScale((value) => Math.min(1.2, value + 0.1))} title="Perbesar teks" aria-label="Perbesar teks">
          <Plus size={20} />
        </button>
        <button className={button} onClick={() => setTheme(light ? "dark" : "light")} title="Ganti tema" aria-label="Ganti tema">
          {light ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className={button} onClick={toggleFullscreen} title="Fullscreen" aria-label="Fullscreen">
          {fullscreen ? <Shrink size={20} /> : <Expand size={20} />}
        </button>
        <span className={`mx-0.5 h-6 w-px max-mobile:hidden ${light ? "bg-black/15" : "bg-white/15"}`} />
        <Link href={`/lagu/${slug}`} className={button} title="Tutup display" aria-label="Tutup display">
          <X size={22} />
        </Link>
      </div>
    </main>
  );
}
