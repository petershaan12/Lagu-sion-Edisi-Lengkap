import Image from "next/image";
import { Gamepad2, Globe } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { CONTAINER } from "@/lib/ui";

function GithubMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.07.78 2.15v3.19c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer
      className={`${CONTAINER} flex min-h-24 py-5 md:py-0 items-center justify-between gap-5 border-t border-line text-[13px] text-muted max-mobile:min-h-32.5 max-mobile:flex-col max-mobile:items-start max-mobile:justify-center max-mobile:gap-3.5`}
    >
      <div className="flex items-center gap-2.25">
        <Image className="size-7 flex-none object-contain" src="/lagusion.png" width={700} height={700} alt="" />
        <span className="flex flex-col leading-tight">
          <span className="font-heading font-bold text-ink">Lagu Sion Edisi Lengkap</span>
          <small className="text-[11px] text-dim">© 2026 Lagu Sion Edisi Lengkap</small>
        </span>
      </div>
      <p className="m-0 flex-1 text-center leading-normal max-mobile:text-left text-xs">
        Bebas dipakai untuk ibadah dan pelayanan, tanpa biaya. Hak cipta tetap milik{" "}
        <a href="https://www.jcadventist.org/tentang-gmahk/" target="_blank" rel="noreferrer" className="font-bold text-ink hover:underline">
          Gereja Masehi Advent Hari Ketujuh
        </a>
        .
      </p>
      <p className="m-0 flex items-center gap-4.5 whitespace-nowrap [&_a]:inline-flex [&_a]:items-center [&_a]:text-ink [&_a:hover]:text-brand">
        <a href="https://petershaan.net" target="_blank" rel="noreferrer" aria-label="petershaan.net" title="petershaan.net">
          <Globe size={18} />
        </a>
        <a
          href="https://github.com/petershaan12/Lagu-sion-Edisi-Lengkap"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          title="GitHub"
        >
          <GithubMark />
        </a>
        <a href="https://shaan.my.id" target="_blank" rel="noreferrer" aria-label="Shabo - Aplikasi PA Games" title="Shabo - Aplikasi PA Games">
          <Gamepad2 size={18} />
        </a>
        <ModeToggle />
      </p>
    </footer>
  );
}
