import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) notFound();
  return children;
}
