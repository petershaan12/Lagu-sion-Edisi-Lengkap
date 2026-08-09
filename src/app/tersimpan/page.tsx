"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Heart, Plus, Presentation, Trash2, X } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { usePlaylists } from "@/components/save-button";
import { LIKED_ID, addPlaylist, isRemovable, moveSong, removePlaylist, removeSong, save } from "@/lib/playlists";
import { songNumber } from "@/lib/song-text";
import { CONTAINER } from "@/lib/ui";

export default function SavedPage() {
  const lists = usePlaylists();
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-ground">
      <main className={`${CONTAINER} pb-24 pt-11 max-mobile:pt-7.5`}>
        <Link href="/#katalog" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft size={18} /> Kembali ke katalog
        </Link>

        <p className="m-0 mb-3 text-xs font-extrabold uppercase text-brand">Tersimpan</p>
        <h1 className="m-0 font-heading text-4xl font-extrabold leading-tight max-mobile:text-3xl">Playlist saya</h1>
        <p className="mb-8 mt-3 max-w-[60ch] text-muted">
          Disimpan di perangkat ini saja, jadi tetap bisa dibuka saat offline dan tidak butuh akun.
        </p>

        <form
          className="mb-10 flex max-w-100 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            save(addPlaylist(lists, name));
            setName("");
          }}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nama playlist baru"
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3.5 text-sm text-ink outline-none focus:border-brand"
          />
          <button type="submit" className="inline-flex h-11 flex-none items-center gap-2 rounded-md bg-brand px-4 font-heading font-bold text-white hover:bg-brand-dark">
            <Plus size={18} /> Buat
          </button>
        </form>

        {lists.map((list) => (
          <section key={list.id} className="mb-12">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-line pb-3">
              <h2 className="m-0 inline-flex items-center gap-2 font-heading text-2xl font-extrabold">
                {list.id === LIKED_ID && <Heart size={20} className="text-brand" fill="currentColor" />}
                {list.name}
                <span className="text-sm font-semibold text-muted">{list.songs.length}</span>
              </h2>
              <span className="flex flex-none items-center gap-4">
                {list.songs.length > 0 && (
                  <Link
                    href={`/display/${list.songs[0].slug}?list=${list.id}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-brand"
                  >
                    <Presentation size={16} /> Display playlist
                  </Link>
                )}
                {isRemovable(list.id) && (
                  <button
                    type="button"
                    onClick={() => save(removePlaylist(lists, list.id))}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-brand"
                  >
                    <Trash2 size={16} /> Hapus playlist
                  </button>
                )}
              </span>
            </div>

            {list.songs.length === 0 ? (
              <p className="m-0 text-sm text-muted">Belum ada lagu. Buka lagu lalu tekan Simpan.</p>
            ) : (
              <ul className="m-0 list-none p-0">
                {list.songs.map((song, index) => (
                  <li key={song.slug} className="flex items-center gap-4 border-b border-line py-3.5 max-mobile:gap-2">
                    <span className="flex flex-none flex-col">
                      <button
                        type="button"
                        onClick={() => save(moveSong(lists, list.id, song.slug, -1))}
                        disabled={index === 0}
                        aria-label={`Naikkan ${song.title}`}
                        className="grid h-5 w-7 place-items-center rounded text-muted hover:text-brand disabled:opacity-25 disabled:hover:text-muted"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => save(moveSong(lists, list.id, song.slug, 1))}
                        disabled={index === list.songs.length - 1}
                        aria-label={`Turunkan ${song.title}`}
                        className="grid h-5 w-7 place-items-center rounded text-muted hover:text-brand disabled:opacity-25 disabled:hover:text-muted"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </span>
                    {song.number > 0 && (
                      <span className="w-11 flex-none font-mono text-sm font-extrabold text-brand">{songNumber(song.number)}</span>
                    )}
                    <Link href={`/lagu/${song.slug}`} className="min-w-0 flex-1 truncate font-semibold text-ink hover:text-brand">
                      {song.title}
                    </Link>
                    <Link
                      href={`/display/${song.slug}?list=${list.id}`}
                      aria-label={`Tampilkan ${song.title} sebagai slide`}
                      className="inline-flex h-9 flex-none items-center gap-2 rounded-md border border-line px-3 text-[13px] font-bold text-ink hover:border-brand hover:text-brand"
                    >
                      <Presentation size={16} />
                      <span className="max-mobile:hidden">Display</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => save(removeSong(lists, list.id, song.slug))}
                      aria-label={`Hapus ${song.title} dari ${list.name}`}
                      className="grid size-9 flex-none place-items-center rounded-md text-muted hover:text-brand"
                    >
                      <X size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
