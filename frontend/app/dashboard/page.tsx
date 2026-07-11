"use client";

import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import Link from "next/link";
import { ClipboardList, AlertCircle, Wrench, CheckCircle2, ArrowRight } from "lucide-react";

interface Asset {
  _id: string;
}

interface Issue {
  _id: string;
  status: string;
  priority: string;
  updatedAt: string;
  createdAt: string;
}

export default function DashboardSummaryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [assetsRes, issuesRes] = await Promise.all([
          api.get("/assets"),
          api.get("/issues"),
        ]);
        setAssets(assetsRes.data.assets || []);
        setIssues(issuesRes.data.issues || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalAssets = assets.length;
  
  const openIssues = issues.filter(
    (issue) => issue.status !== "Resolved" && issue.status !== "Closed"
  );
  
  const criticalIssues = issues.filter(
    (issue) => issue.priority === "Critical" && issue.status !== "Resolved" && issue.status !== "Closed"
  );

  const resolvedThisWeek = issues.filter((issue) => {
    if (issue.status !== "Resolved") return false;
    const resolvedDate = new Date(issue.updatedAt || issue.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return resolvedDate >= oneWeekAgo;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-medium text-zinc-500">Calculating dashboard statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-950/20 dark:bg-red-950/20">
        <h2 className="font-semibold">Error Loading Dashboard</h2>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Operations Center
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Real-time status summaries and facility indicators
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Assets */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total Assets</span>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{totalAssets}</div>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
            <ClipboardList className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          </div>
        </div>

        {/* Open Issues */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Open Issues</span>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{openIssues.length}</div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
            <Wrench className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {/* Critical Issues */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Critical Alerts</span>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{criticalIssues.length}</div>
          </div>
          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Resolved This Week */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Resolved (7d)</span>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{resolvedThisWeek.length}</div>
          </div>
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Navigation Quicklinks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 space-y-3">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Assets Inventory</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Check operational status, generate and download QR identifying tags, or register new physical assets.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/assets"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
            >
              Browse Inventory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 space-y-3">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Incident Management</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Review reported problems, allocate technicians to active faults, or triage issues using AI recommendations.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/issues"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
            >
              Manage Faults <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
