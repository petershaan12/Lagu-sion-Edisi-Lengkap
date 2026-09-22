import { getAdjacentSlugs, getSongBySlug, getSongs } from "@/lib/songs";
import { DEFAULT_COLLECTION } from "@/lib/song";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
    const slug = params.get("slug");
    try {
      const adjacent = params.get("adjacent");
      if (adjacent) {
        const song = await getSongBySlug(adjacent);
        if (!song) return Response.json({ error: "Lagu tidak ditemukan" }, { status: 404 });
        return Response.json(await getAdjacentSlugs(song));
      }
      if (slug) {
      if (slug.length > 250) return Response.json({ error: "Lagu tidak valid" }, { status: 400 });
      const song = await getSongBySlug(slug);
      return song ? Response.json(song) : Response.json({ error: "Lagu tidak ditemukan" }, { status: 404 });
    }
    const query = (params.get("q") || "").trim();
    if (query.length > 150) return Response.json({ error: "Pencarian terlalu panjang" }, { status: 400 });
    const requestedLimit = Number(params.get("limit"));
    const limit = Number.isInteger(requestedLimit) ? Math.min(500, Math.max(1, requestedLimit)) : 20;
    const { songs, total } = await getSongs(query, 1, limit, params.get("katalog") || DEFAULT_COLLECTION);
    return Response.json({ total, songs: songs.map(({ slug, number, title, artist, chords }) => ({ slug, number, title, artist, hasChords: Boolean(chords) })) });
  } catch {
    return Response.json({ error: "Lagu belum bisa dimuat. Coba lagi." }, { status: 503 });
  }
}
