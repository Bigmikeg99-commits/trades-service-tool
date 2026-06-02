"use client";

import Link from "next/link";
import { login } from "@/app/actions/auth";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors disabled:opacity-70 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);

  return (
    <div className="pro-card p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tighter">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to your field service account
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="••••••••"
          />
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don’t have an account?{" "}
        <Link href="/signup" className="font-medium text-zinc-900 hover:underline dark:text-white">
          Create one
        </Link>
      </p>
    </div>
  );
}