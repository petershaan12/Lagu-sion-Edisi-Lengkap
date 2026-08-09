import { CornerDownLeft } from "lucide-react";

export function NumberJump({ className = "", display = false }: { className?: string; display?: boolean }) {
  return (
    <form action="/nomor" className={`inline-flex h-9 items-center rounded-md border border-line bg-surface pl-2.5 focus-within:border-brand ${className}`}>
      {display && <input type="hidden" name="ke" value="display" />}
      <label htmlFor="lompat-nomor" className="text-[11px] font-bold uppercase text-dim">
        No.
      </label>
      <input
        id="lompat-nomor"
        name="n"
        type="number"
        min="1"
        inputMode="numeric"
        placeholder="45"
        aria-label="Lompat ke nomor lagu"
        className="h-full w-14 min-w-0 border-0 bg-transparent px-2 text-sm font-bold text-ink outline-none placeholder:font-normal placeholder:text-dim"
      />
      <button
        type="submit"
        aria-label="Buka nomor lagu"
        className="grid h-full w-8 flex-none place-items-center rounded-r-md text-dim hover:text-brand"
      >
        <CornerDownLeft size={15} />
      </button>
    </form>
  );
}
