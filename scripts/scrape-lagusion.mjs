// Scrape Lagu Sion 1-525 from lagusiononline.blogspot.com into MongoDB.
// Usage: node --env-file=.env.local scripts/scrape-lagusion.mjs [--dry] [--from 1] [--to 525]
import { MongoClient } from "mongodb";

const INDEX = "https://lagusiononline.blogspot.com/p/lagu-sion.html";
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(name);
  return at === -1 ? fallback : Number(args[at + 1]);
};
const dry = args.includes("--dry");
const from = flag("--from", 1);
const to = flag("--to", 525);

const entities = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", ndash: "–", mdash: "—" };

function decode(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (whole, name) => entities[name] ?? whole);
}

function textLines(html) {
  return decode(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|p|h\d|tr|li)>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .split("\n")
    .map((line) => line.replace(/ /g, " ").trim());
}

function slugify(title, number) {
  return `${number}-${title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

// Sumber menulis judul kapital semua: "HADIRAT-MU" -> "Hadirat-Mu".
function titleCase(title) {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean !== clean.toUpperCase()) return clean;
  return clean.toLowerCase().replace(/(^|[\s(“"'\-])([a-z])/g, (_, before, letter) => before + letter.toUpperCase());
}

async function fetchText(url, tries = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "lagusion-import/1.0" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      if (attempt >= tries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
}

async function getIndex() {
  const html = await fetchText(INDEX);
  const found = new Map();
  const anchors = html.matchAll(/<a[^>]+href="(https?:\/\/lagusiononline\.blogspot\.[^"]*\/20\d\d\/\d\d\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g);
  for (const [, url, label] of anchors) {
    const number = Number(label.replace(/<[^>]+>/g, "").trim());
    if (!Number.isInteger(number) || number < 1 || number > 525) continue;
    if (!found.has(number)) found.set(number, url.replace("blogspot.co.id", "blogspot.com").replace("http://", "https://"));
  }
  return found;
}

const VERSE_MARKER = /^(\d+\s*\/\s*\d+|reff?\.?|refrein|koor|chorus|ulangan)\b/i;

// Page shape: header lines (time signature, key), a "NNN JUDUL" title line,
// then verses introduced by "1/4"-style markers.
function parseSong(html, number) {
  const body = html.match(/<div class=['"]post-body[^>]*>([\s\S]*?)<div class=['"]post-footer/);
  const lines = textLines(body ? body[1] : html);
  // "001  DI HADAPAN HADIRAT-MU" — but not the key line "2#=D".
  const numberPattern = new RegExp(`^0*${number}[\\s.:-]+(.*[a-z].*)$`, "i");

  // Sebagian halaman salah nomor (index bilang 328, judul tertulis 327),
  // jadi nomor apa pun di baris judul diterima sebagai cadangan.
  const anyNumber = /^0*\d{1,3}[\s.:-]+(.*[a-z].*)$/i;
  let titleAt = -1;
  let title = "";
  for (const pattern of [numberPattern, anyNumber]) {
    for (let index = 0; index < lines.length && titleAt === -1; index++) {
      const match = lines[index].match(pattern);
      if (match && match[1].trim().length > 2) {
        titleAt = index;
        title = match[1].trim();
      }
    }
    if (titleAt !== -1) break;
  }
  if (titleAt === -1) return null;

  const header = lines.slice(0, titleAt).filter(Boolean);
  const timeSignature = header.find((line) => /^\d+\/\d+$/.test(line)) || "";
  const key = (header.find((line) => /=[A-G][b#]?$/i.test(line)) || "").split("=")[1] || "";

  // Beberapa lagu pendek tidak punya penanda bait sama sekali.
  const rest = lines
    .slice(titleAt + 1)
    .filter((line) => !/\(\s*(d\.|\d{4})|^\d{4}\s*[-–]\s*\d{4}$/.test(line));
  const firstVerse = rest.findIndex((line) => VERSE_MARKER.test(line));

  const verses = [];
  let current = [];
  for (const line of rest.slice(firstVerse === -1 ? 0 : firstVerse)) {
    if (VERSE_MARKER.test(line)) {
      if (current.length) verses.push(current);
      current = /^\d+\s*\/\s*\d+$/.test(line) ? [] : [line];
      continue;
    }
    if (line) current.push(line);
    else if (firstVerse === -1 && current.length) {
      verses.push(current);
      current = [];
    }
  }
  if (current.length) verses.push(current);

  const lyrics = verses.map((verse) => verse.join("\n")).filter(Boolean).join("\n\n");
  if (!lyrics) return null;

  const youtube = html.match(/(?:youtube\.com\/embed\/|youtu\.be\/|watch\?v=)([\w-]{11})/);

  return {
    number,
    title: titleCase(title),
    slug: slugify(title, number),
    key: key.toUpperCase(),
    timeSignature,
    lyrics,
    chords: "",
    youtubeUrl: youtube ? `https://www.youtube.com/watch?v=${youtube[1]}` : "",
    language: "Indonesia",
    category: "",
    published: true,
  };
}

const index = await getIndex();
console.log(`index: ${index.size} lagu`);

const songs = [];
const failed = [];
for (let number = from; number <= to; number++) {
  const url = index.get(number);
  if (!url) {
    failed.push(`${number}: tidak ada di index`);
    continue;
  }
  try {
    const song = parseSong(await fetchText(url), number);
    if (!song) throw new Error("gagal parse");
    songs.push(song);
  } catch (error) {
    failed.push(`${number}: ${error.message}`);
  }
  if (number % 25 === 0) console.log(`... ${number} (ok ${songs.length}, gagal ${failed.length})`);
}

console.log(`parsed ${songs.length}, gagal ${failed.length}`);
if (failed.length) console.log(failed.join("\n"));

if (dry) {
  console.log(JSON.stringify(songs.slice(0, 2), null, 2));
  process.exit(0);
}

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const collection = client.db(process.env.MONGODB_DB || "lagusion").collection("songs");
const now = new Date();
const result = await collection.bulkWrite(
  songs.map((song) => ({
    updateOne: {
      filter: { number: song.number },
      update: { $set: { ...song, updatedAt: now }, $setOnInsert: { createdAt: now } },
      upsert: true,
    },
  })),
);
console.log(`upsert: ${result.upsertedCount} baru, ${result.modifiedCount} diperbarui`);
await client.close();
