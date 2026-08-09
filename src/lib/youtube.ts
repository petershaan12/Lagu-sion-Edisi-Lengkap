export function getYoutubeId(value: string): string | null {
  if (!value.trim()) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") return validId(url.pathname.split("/")[1]);
    if (!host.endsWith("youtube.com")) return null;
    if (url.pathname === "/watch") return validId(url.searchParams.get("v"));

    const [, type, id] = url.pathname.split("/");
    return ["embed", "shorts", "live"].includes(type) ? validId(id) : null;
  } catch {
    return null;
  }
}

function validId(value: string | null | undefined): string | null {
  return value && /^[\w-]{11}$/.test(value) ? value : null;
}
