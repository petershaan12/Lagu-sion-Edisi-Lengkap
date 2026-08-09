import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { NumberJump } from "@/components/number-jump";
import { CONTAINER } from "@/lib/ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-17 border-b border-line bg-ground/90 backdrop-blur-md">
      <div className={`${CONTAINER} flex h-full items-center justify-between`}>
        <Link
          href="/"
          className="inline-flex items-center gap-2.75 font-heading text-base font-bold max-mobile:text-[13px]"
          aria-label="Lagu Sion Edisi Lengkap - Beranda"
        >
          <Image className="size-9 flex-none rounded-lg object-contain" src="/lagusion.png" width={1254} height={1254} alt="" priority />
          <span>Lagu Sion Edisi Lengkap</span>
        </Link>
        <div className="flex items-center gap-2">
          <NumberJump className="max-mobile:hidden" />
          <Link
            href="/tersimpan"
            className="inline-flex h-9 items-center gap-1.75 rounded-md border border-line px-3 text-[13px] font-bold text-ink hover:border-brand hover:text-brand"
          >
            <Heart size={16} />
            <span className="max-mobile:hidden">Tersimpan</span>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
