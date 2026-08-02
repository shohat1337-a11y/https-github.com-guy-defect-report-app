"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "כניסה נכשלה");
        return;
      }
      const next = searchParams.get("next") || "/";
      router.push(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch {
      setError("כניסה נכשלה. נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="text-5xl">🏗️</div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">דוחות ליקויים</h1>
          <p className="mt-1 text-sm text-slate-500">כניסה למערכת</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-700">
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            placeholder="הזינו סיסמה"
          />

          {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || password.length === 0}
            className="mt-5 w-full rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-md active:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "נכנס..." : "כניסה"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
