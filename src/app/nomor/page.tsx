import { redirect } from "next/navigation";
import { getSongByNumber } from "@/lib/songs";
import type { NumberJumpProps } from "@/types";

export const dynamic = "force-dynamic";

export default async function NumberJumpPage({ searchParams }: NumberJumpProps) {
  const query = await searchParams;
  const raw = query.n?.trim() || "";
  const song = /^\d+$/.test(raw) ? await getSongByNumber(Number(raw)) : null;
  if (song) redirect(`/${query.ke === "display" ? "display" : "lagu"}/${song.slug}`);
  redirect(`/${raw ? `?q=${encodeURIComponent(raw)}` : ""}#katalog`);
}
