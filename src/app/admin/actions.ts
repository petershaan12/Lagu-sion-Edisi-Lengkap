"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  createAdminToken,
  isAdmin,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { addCollection, getCollections, renameCollection } from "@/lib/collections";
import { DEFAULT_COLLECTION, collectionOf, pickCollection } from "@/lib/song";
import { deleteSong, saveSong } from "@/lib/songs";
import { slugifySong } from "@/lib/song-text";
import { getYoutubeId } from "@/lib/youtube";
import type { ActionState } from "@/types";

const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

async function tooManyAttempts(): Promise<boolean> {
  const key = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.until < now) {
    attempts.set(key, { count: 1, until: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function loginAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (await tooManyAttempts()) return { error: "Terlalu banyak percobaan. Coba lagi nanti." };

  const password = String(formData.get("password") || "");
  if (!verifyAdminPassword(password)) return { error: "Password tidak sesuai." };

  (await cookies()).set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/");
}

export async function saveSongAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return { error: "Sesi admin sudah berakhir." };

  const collections = await getCollections();
  const songCollection = pickCollection(collections, String(formData.get("collection") || ""));
  const numbered = collectionOf(collections, songCollection).numbered;
  const number = numbered ? Number(formData.get("number")) : 0;
  const title = String(formData.get("title") || "").trim();
  const lyrics = String(formData.get("lyrics") || "").trim();
  const youtubeUrl = String(formData.get("youtubeUrl") || "").trim();

  if (numbered && (!Number.isInteger(number) || number < 1)) return { error: "Nomor lagu tidak valid." };
  if (title.length < 2) return { error: "Judul lagu terlalu pendek." };
  if (!lyrics) return { error: "Lirik wajib diisi." };
  if (youtubeUrl && !getYoutubeId(youtubeUrl)) return { error: "Link YouTube tidak valid." };

  try {
    await saveSong(
      {
        collection: songCollection,
        number,
        artist: String(formData.get("artist") || "").trim(),
        title,
        slug: slugifySong(title, number),
        key: String(formData.get("key") || "").trim(),
        timeSignature: String(formData.get("timeSignature") || "").trim(),
        lyrics,
        chords: String(formData.get("chords") || "").trim(),
        youtubeUrl,
        language: String(formData.get("language") || "Indonesia").trim(),
        category: String(formData.get("category") || "").trim(),
        published: formData.get("published") === "on",
      },
      String(formData.get("originalSlug") || ""),
    );
  } catch (error) {
    const duplicate = error instanceof Error && error.message.includes("E11000");
    return {
      error: duplicate
        ? "Nomor atau slug lagu sudah digunakan."
        : "Lagu gagal disimpan. Periksa koneksi MongoDB.",
    };
  }

  redirect("/admin?saved=1");
}

export async function renameCollectionAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/");

  const id = String(formData.get("id") || "");
  const label = String(formData.get("label") || "").trim();
  const known = (await getCollections()).some((item) => item.id === id);
  if (!known || label.length < 2) redirect("/admin");

  await renameCollection(id, label);
  redirect(`/admin?renamed=1${id === DEFAULT_COLLECTION ? "" : `&katalog=${id}`}`);
}

export async function addCollectionAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/");

  const label = String(formData.get("label") || "").trim();
  const id = slugifySong(label);
  if (label.length < 2 || !id) redirect("/admin");

  const created = await addCollection(id, label, formData.get("numbered") === "on");
  redirect(created ? `/admin?added=1&katalog=${id}` : "/admin?duplikat=1");
}

export async function deleteSongAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/");
  await deleteSong(String(formData.get("slug") || ""));
  redirect("/admin?deleted=1");
}
