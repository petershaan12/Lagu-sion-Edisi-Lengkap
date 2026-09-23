export type PresentationState = {
  slug: string;
  mode: "lyrics" | "chord";
  index: number;
  blank: boolean;
  blackout: boolean;
  dark: boolean;
  active: boolean;
  updatedAt: number;
};

export function isPresentationState(value: unknown): value is PresentationState {
  if (!value || typeof value !== "object") return false;
  const state = value as PresentationState;
  return typeof state.slug === "string" && state.slug.length > 0 && state.slug.length <= 250
    && (state.mode === "lyrics" || state.mode === "chord")
    && Number.isInteger(state.index) && state.index >= 0 && state.index < 1000
    && typeof state.blank === "boolean" && typeof state.blackout === "boolean" && typeof state.dark === "boolean" && typeof state.active === "boolean"
    && Number.isFinite(state.updatedAt) && state.updatedAt > 0;
}

export function moveSlide(index: number, delta: number, count: number): number {
  return Math.max(0, Math.min(Math.max(0, count - 1), index + delta));
}

export const validRoom = (room: string) => /^[a-f0-9-]{36}$/.test(room);

type PresentationScreen = { availLeft: number; availTop: number; availWidth: number; availHeight: number };
export type ScreenDetails = { screens: PresentationScreen[]; currentScreen: PresentationScreen };
