import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

// Exercise the real query/navigation code with demo data, never the live database.
const source = await readFile(new URL("../src/lib/songs.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const isolated = outputText
  .replace(/import .* from "@\/lib\/mongodb";/, "const isMongoConfigured = () => false;")
  .replace('"@/lib/song"', JSON.stringify(new URL("../src/lib/song.ts", import.meta.url).href));
const { getSongs, getAdjacentSlugs } = await import(`data:text/javascript;base64,${Buffer.from(isolated).toString("base64")}`);

test("navigation follows the catalog or the complete search results and stops at the ends", async () => {
  const { songs } = await getSongs();
  const [first, middle, last] = songs;
  assert.deepEqual(await getAdjacentSlugs(middle), { previous: first.slug, next: last.slug });
  assert.deepEqual(await getAdjacentSlugs(first), { previous: null, next: middle.slug });
  assert.deepEqual(await getAdjacentSlugs(last), { previous: middle.slug, next: null });
  // 'damai' matches the first and last songs, skipping the middle song.
  assert.deepEqual(await getAdjacentSlugs(first, "damai"), { previous: null, next: last.slug });
  assert.deepEqual(await getAdjacentSlugs(last, "damai"), { previous: first.slug, next: null });
  assert.deepEqual(await getAdjacentSlugs(first, "Kasih-Mu Menuntun"), { previous: null, next: null });
  assert.deepEqual(await getAdjacentSlugs(first, "tidak ditemukan"), { previous: null, next: null });
  assert.deepEqual(await getAdjacentSlugs(middle, "   "), await getAdjacentSlugs(middle));
});
