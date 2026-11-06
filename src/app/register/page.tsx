"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const name = form.get("name") as string;
    const role = (form.get("role") as string) || "CREATOR";
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative">
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      <div className="card w-full max-w-md p-8 md:p-10 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">ProofLoom</span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Join your brand&apos;s governance & review workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-sm placeholder-slate-400"
                placeholder="Maya Content Marketer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-sm placeholder-slate-400"
                placeholder="creator@acme.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Role
            </label>
            <select
              name="role"
              defaultValue="CREATOR"
              className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-sm"
            >
              <option value="CREATOR">Content Marketer (Creator)</option>
              <option value="REVIEWER">Brand Reviewer / Compliance</option>
              <option value="BRAND_OWNER">Brand Owner / Director</option>
              <option value="ADMIN">System Admin</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-sm placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/25 disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Creating account…" : (
              <>
                Create account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5 text-center">
          <p className="text-xs text-slate-500">Already have an account?</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
