import { notFound, redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLoginPage({ params }: { params: Promise<{ gate: string }> }) {
  const gate = process.env.ADMIN_GATE || "";
  if (!gate || (await params).gate !== gate) notFound();
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#0b1020] p-8">
      <div className="absolute inset-0 -z-30 bg-[url('/hymnal-hero.png')] bg-cover bg-center" />
      <div className="absolute inset-0 -z-20 bg-[#070b16]/80" />
      <div className="absolute -top-52 left-1/2 -z-10 size-160 -translate-x-1/2 rounded-full bg-brand/25 blur-[140px]" />
      <div className="w-[min(320px,100%)] rounded-lg bg-white p-6 shadow-2xl">
        <LoginForm />
      </div>
    </main>
  );
}
