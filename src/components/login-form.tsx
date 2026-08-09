"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { loginAction } from "@/app/admin/actions";

const initialState = { error: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Password"
        aria-label="Password"
        autoFocus
        required
        autoComplete="current-password"
        className="h-10 w-full rounded-md border border-[#d9dfeb] bg-white px-3 text-sm text-[#17364a] outline-none placeholder:text-[#8a97ad] focus:border-brand"
      />
      {state.error && <p className="m-0 text-[13px] text-coral" role="alert">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 font-heading text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}
        Masuk
      </button>
    </form>
  );
}
