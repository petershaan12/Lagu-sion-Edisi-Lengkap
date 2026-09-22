import assert from "node:assert/strict";
import test from "node:test";
import { joinReff, lyricsToDisplaySlides, lyricsToSlides, lyricsToVerses, normalizeReffMarkers, slugifySong, splitReff } from "../src/lib/song-text.ts";

test("normalisasi Ref mempertahankan isi dan keterangan tanpa menghitung reff sebagai bait", () => {
  for (const marker of ["Ref:", "Ref.", "Ref :", "Reff.", "Reff:"]) {
    const text = normalizeReffMarkers(`bait satu\n\n${marker}\nreff lagu\n\nbait dua`);
    assert.equal(text, "bait satu\n\nReff:\nreff lagu\n\nbait dua");
    assert.deepEqual(lyricsToVerses(text).map(({ reff, bait }) => ({ reff, bait })), [
      { reff: false, bait: 1 }, { reff: true, bait: 0 }, { reff: false, bait: 2 },
    ]);
    assert.equal(normalizeReffMarkers(text), text);
  }
  for (const marker of ["Ref: 1-4", "Ref: 5", "Ref ayat 4:"]) {
    const text = normalizeReffMarkers(`${marker}\nisi reff`);
    assert.equal(lyricsToVerses(text)[0].reff, true);
    assert.ok(text.includes(`(ayat ${marker.match(/\d+(?:-\d+)?/)![0]})\nisi reff`));
  }
  assert.equal(normalizeReffMarkers("bait satu\n\nbait dua"), "bait satu\n\nbait dua");
});

test("memisahkan satu bait menjadi satu slide", () => {
  assert.deepEqual(lyricsToSlides("baris 1\nbaris 2\n\nbaris 3"), [
    "baris 1\nbaris 2",
    "baris 3",
  ]);
});

test("membuat slug stabil dari nomor dan judul", () => {
  assert.equal(slugifySong("Kasih-Mu Menuntun!", 12), "12-kasih-mu-menuntun");
});

test("menyelipkan reff setelah tiap bait tanpa menghitungnya sebagai bait", () => {
  const slides = lyricsToDisplaySlides("bait satu\n\nReff:\nreff lagu\n\nbait dua\n\nbait tiga");
  assert.deepEqual(slides, [
    { text: "bait satu", reff: false, bait: 1 },
    { text: "reff lagu", reff: true, bait: 0 },
    { text: "bait dua", reff: false, bait: 2 },
    { text: "reff lagu", reff: true, bait: 0 },
    { text: "bait tiga", reff: false, bait: 3 },
    { text: "reff lagu", reff: true, bait: 0 },
  ]);
});

test("reff yang ditulis ulang tidak dobel", () => {
  const slides = lyricsToDisplaySlides("bait satu\n\nReff:\nreff lagu\n\nbait dua\n\nReff:\nreff lagu");
  assert.equal(slides.filter((slide) => slide.reff).length, 2);
});

test("splitReff dan joinReff bolak-balik tanpa kehilangan isi", () => {
  const stored = "bait satu\n\nReff:\nreff lagu\n\nbait dua";
  const { verses, reff } = splitReff(stored);
  assert.equal(verses, "bait satu\n\nbait dua");
  assert.equal(reff, "reff lagu");
  assert.equal(joinReff(verses, reff), stored);
  assert.equal(joinReff(verses, ""), verses);
});

test("lagu tanpa reff tetap urut biasa", () => {
  const slides = lyricsToDisplaySlides("bait satu\n\nbait dua");
  assert.deepEqual(slides.map((slide) => slide.bait), [1, 2]);
});
