"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, LogOut, ShieldAlert, ClipboardList } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-sm font-medium text-zinc-500">Loading Dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">Access Denied</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            This dashboard is restricted to administrators only.
          </p>
          <button
            onClick={logout}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
        <div className="p-6 border-b border-zinc-150 dark:border-zinc-800">
          <Link href="/dashboard/assets" className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-zinc-50">
            <LayoutDashboard className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
            <span>MaintainIQ</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard/assets"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <ClipboardList className="h-4 w-4" />
            <span>Assets Inventory</span>
          </Link>
          <Link
            href="/dashboard/assets/new"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Asset</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between px-8">
          <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Admin Panel
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {user.name}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 uppercase">
              {user.role}
            </span>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
