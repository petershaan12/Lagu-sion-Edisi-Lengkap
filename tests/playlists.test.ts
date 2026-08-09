import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_PLAYLISTS,
  LIKED_ID,
  addPlaylist,
  hasSong,
  isRemovable,
  moveSong,
  playlistId,
  removePlaylist,
  removeSong,
  toggleSong,
  withDefaults,
} from "../src/lib/playlists.ts";

const song = { slug: "1-kasih-mu-menuntun", number: 1, title: "Kasih-Mu Menuntun" };

test("playlist bawaan selalu ada dan isinya tersimpan", () => {
  assert.deepEqual(withDefaults(null).map((list) => list.id), ["suka", "sekolah-sabat", "khotbah"]);
  assert.deepEqual(withDefaults("rusak"), DEFAULT_PLAYLISTS);

  const stored = [{ id: "khotbah", name: "Khotbah", songs: [song] }];
  const merged = withDefaults(stored);
  assert.deepEqual(merged.map((list) => list.id), ["suka", "sekolah-sabat", "khotbah"]);
  assert.equal(merged.at(-1)?.songs.length, 1);
});

test("toggle menambah lalu menghapus lagu", () => {
  const liked = toggleSong(DEFAULT_PLAYLISTS, LIKED_ID, song);
  assert.ok(hasSong(liked, LIKED_ID, song.slug));
  assert.ok(!hasSong(liked, "khotbah", song.slug));
  assert.ok(!hasSong(toggleSong(liked, LIKED_ID, song), LIKED_ID, song.slug));
  assert.ok(!hasSong(removeSong(liked, LIKED_ID, song.slug), LIKED_ID, song.slug));
});

test("moveSong menggeser urutan dan diam di ujung", () => {
  const slugs = (lists: ReturnType<typeof withDefaults>) => lists.at(-1)!.songs.map((item) => item.slug);
  const khotbah = withDefaults(null);
  const first = slugs(khotbah)[0];

  assert.equal(slugs(moveSong(khotbah, "khotbah", first, 1))[1], first);
  assert.deepEqual(slugs(moveSong(khotbah, "khotbah", first, -1)), slugs(khotbah));
  assert.deepEqual(slugs(moveSong(khotbah, "khotbah", "tidak-ada", 1)), slugs(khotbah));
});

test("playlist baru dapat id unik dan bisa dihapus", () => {
  const lists = addPlaylist(addPlaylist(DEFAULT_PLAYLISTS, "Ibadah Pemuda"), "Ibadah Pemuda");
  assert.deepEqual(lists.slice(-2).map((list) => list.id), ["ibadah-pemuda", "ibadah-pemuda-2"]);
  assert.equal(playlistId("!!!", lists), "playlist");
  assert.equal(addPlaylist(lists, "   ").length, lists.length);

  assert.equal(removePlaylist(lists, "ibadah-pemuda").length, lists.length - 1);
  assert.ok(!isRemovable(LIKED_ID));
  assert.equal(removePlaylist(lists, LIKED_ID).length, lists.length);
});
