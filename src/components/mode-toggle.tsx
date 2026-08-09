"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className={`grid size-9 place-items-center rounded-md border border-line text-muted transition-colors hover:text-ink ${className}`}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title="Ganti mode terang atau gelap"
      aria-label="Ganti mode terang atau gelap"
    >
      <Sun size={18} className="dark:hidden" />
      <Moon size={18} className="hidden dark:block" />
    </button>
  );
}
