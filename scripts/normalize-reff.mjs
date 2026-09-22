// Usage: node --env-file=.env.local scripts/normalize-reff.mjs [--apply]
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MongoClient, BSON } from "mongodb";
import { normalizeReffMarkers, lyricsToVerses } from "../src/lib/song-text.ts";

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const collection = client.db(process.env.MONGODB_DB || "lagusion").collection("songs");
  const songs = await collection.find({}, { projection: { number: 1, lyrics: 1, chords: 1, updatedAt: 1 } }).toArray();
  const changes = songs.flatMap((song) => {
    const fields = Object.fromEntries(["lyrics", "chords"].flatMap((field) => {
      if (typeof song[field] !== "string") return [];
      const value = normalizeReffMarkers(song[field]);
      return value === song[field] ? [] : [[field, value]];
    }));
    return Object.keys(fields).length ? [{ song, fields }] : [];
  });
  console.log(JSON.stringify({ scanned: songs.length, changes: changes.length, numbers: changes.map(({ song }) => song.number) }));
  if (process.argv.includes("--apply") && changes.length) {
    const backup = join(await mkdtemp(join(tmpdir(), "lagusion-reff-")), "before.json");
    await writeFile(backup, BSON.EJSON.stringify(changes.map(({ song }) => song)), { mode: 0o600 });
    console.log(`Backup: ${backup}`);
    const result = await collection.bulkWrite(changes.map(({ song, fields }) => ({
      updateOne: {
        filter: { _id: song._id, ...Object.fromEntries(Object.keys(fields).map((field) => [field, song[field]])) },
        update: { $set: { ...fields, updatedAt: new Date() } },
      },
    })));
    assert.equal(result.matchedCount, changes.length, "Some songs changed concurrently; check backup before retrying");
    for (const { song, fields } of changes) {
      const saved = await collection.findOne({ _id: song._id });
      for (const [field, value] of Object.entries(fields)) {
        assert.equal(saved[field], value);
        assert.equal(normalizeReffMarkers(saved[field]), saved[field]);
        assert.ok(lyricsToVerses(saved[field]).some((verse) => verse.reff));
      }
    }
    console.log(`Updated and verified: ${result.modifiedCount} songs`);
  }
} finally {
  await client.close();
}
