import type { Visited } from "@/types";

const KEY = "lagusion:visited";
const MAX = 300;

const EMPTY: Visited = {};

let cache: Visited | null = null;
const listeners = new Set<() => void>();

function load(): Visited {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Visited) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function snapshot(): Visited {
  return (cache ??= load());
}

export function serverSnapshot(): Visited {
  return EMPTY;
}

export function recordVisit(slug: string) {
  const next = Object.fromEntries(
    Object.entries({ ...snapshot(), [slug]: Date.now() })
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX),
  );
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
  }
  listeners.forEach((listener) => listener());
}

export function recencyRank(visited: Visited): Record<string, number> {
  const ranked: Record<string, number> = {};
  Object.entries(visited)
    .sort((a, b) => b[1] - a[1])
    .forEach(([slug], index) => {
      ranked[slug] = index;
    });
  return ranked;
}
