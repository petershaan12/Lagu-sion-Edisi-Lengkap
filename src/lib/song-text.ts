import type { DisplaySlide } from "@/types";

export function slugifySong(title: string, number?: number): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return number ? `${number}-${slug}` : slug;
}

export function songNumber(number: number): string {
  return number > 0 ? String(number).padStart(3, "0") : "";
}

export function lyricsToSlides(lyrics: string): string[] {
  return lyrics
    .trim()
    .split(/\n\s*\n+/)
    .map((slide) => slide.trim())
    .filter(Boolean);
}

const isReffBlock = (block: string) => /^reff\b\s*[:.]?\s*$/i.test(block.split("\n")[0].trim());
const reffText = (block: string) => block.split("\n").slice(1).join("\n").trim();

export function lyricsToDisplaySlides(lyrics: string): DisplaySlide[] {
  const blocks = lyricsToSlides(lyrics);
  const slides: DisplaySlide[] = [];
  let reff = "";
  let bait = 0;

  blocks.forEach((block, index) => {
    if (isReffBlock(block)) {
      const text = reffText(block) || reff;
      if (!text) return;
      reff ||= text;
      slides.push({ text, reff: true, bait: 0 });
      return;
    }
    bait += 1;
    slides.push({ text: block, reff: false, bait });
    if (reff && !(blocks[index + 1] && isReffBlock(blocks[index + 1]))) {
      slides.push({ text: reff, reff: true, bait: 0 });
    }
  });

  return slides;
}

// Verses as written (reff once, marker stripped) — for the lyrics page.
export function lyricsToVerses(lyrics: string): DisplaySlide[] {
  let bait = 0;
  return lyricsToSlides(lyrics)
    .map((block) => {
      if (isReffBlock(block)) return { text: reffText(block), reff: true, bait: 0 };
      bait += 1;
      return { text: block, reff: false, bait };
    })
    .filter((verse) => verse.text);
}

// Admin form edits the reff in its own field; storage stays one lyrics string
// with a "Reff:" marker block, so these two must round-trip.
export function splitReff(lyrics: string): { verses: string; reff: string } {
  const blocks = lyricsToSlides(lyrics);
  const reff = blocks.filter(isReffBlock).map(reffText).find(Boolean) || "";
  return { verses: blocks.filter((block) => !isReffBlock(block)).join("\n\n"), reff };
}

export function joinReff(verses: string, reff: string): string {
  const blocks = lyricsToSlides(verses);
  const clean = reff.trim();
  if (!clean || blocks.length === 0) return blocks.join("\n\n");
  return [blocks[0], `Reff:\n${clean}`, ...blocks.slice(1)].join("\n\n");
}

export function excerpt(lyrics: string, length = 145): string {
  const text = lyrics.replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}
