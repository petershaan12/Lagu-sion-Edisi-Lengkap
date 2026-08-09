"use client";

import { useEffect } from "react";
import { recordVisit } from "@/lib/visited";

export function VisitTracker({ slug }: { slug: string }) {
  useEffect(() => recordVisit(slug), [slug]);
  return null;
}
