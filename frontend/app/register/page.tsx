"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const { registerUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("technician");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser(name, email, password, role);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Get started with MaintainIQ portal setup
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950/30 dark:text-green-400">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50"
            >
              <option value="technician">Technician</option>
              <option value="admin">Administrator (Admin)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Already have an account? </span>
          <Link
            href="/login"
            className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
