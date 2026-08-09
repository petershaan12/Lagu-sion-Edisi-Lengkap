import { OG_CONTENT_TYPE, OG_SIZE, displaySlideImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Lagu Sion Edisi Lengkap";

export default function Image() {
  return displaySlideImage("Lirik | PPT | Chord | Audio", "Lagu Sion Edisi Lengkap");
}
