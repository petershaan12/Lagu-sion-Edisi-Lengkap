import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lagu Sion Edisi Lengkap",
    short_name: "Lagu Sion",
    description: "Katalog lirik dan chord dengan mode slide untuk ibadah.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#204FEF",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
