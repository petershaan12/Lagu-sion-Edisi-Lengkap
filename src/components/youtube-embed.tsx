import { getYoutubeId } from "@/lib/youtube";

export function YoutubeEmbed({ url, title }: { url: string; title: string }) {
  const id = getYoutubeId(url);
  if (!id) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-black">
      <iframe
        className="size-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={`Video ${title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
