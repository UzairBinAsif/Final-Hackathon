"use client";

import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import Link from "next/link";
import { Search, PlusCircle, ArrowRight, RefreshCw } from "lucide-react";

interface Asset {
  _id: string;
  name: string;
  assetCode: string;
  category: string;
  location: string;
  condition: string;
  status: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (status) params.status = status;

      const response = await api.get("/assets", { params });
      setAssets(response.data.assets || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchAssets();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, status]);

  // Categories list options (based on schema category requirements)
  const categories = [
    "Electrical",
    "Mechanical",
    "Plumbing",
    "HVAC",
    "Infrastructure",
    "Safety",
    "Other",
  ];

  // Status list options
  const statuses = [
    "Operational",
    "Issue Reported",
    "Under Inspection",
    "Under Maintenance",
    "Out of Service",
    "Retired",
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Assets Inventory
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your facility equipment and operational conditions
          </p>
        </div>
        <Link
          href="/dashboard/assets/new"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <PlusCircle className="h-4 w-4" /> Add Asset
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 items-stretch sm:flex-row sm:items-center bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 sm:flex-initial rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 sm:flex-initial rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={fetchAssets}
            className="p-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Assets Display - Table on Desktop, Cards on Mobile */}
      <div className="bg-white rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        {loading && assets.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            Fetching assets...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">
            Error: {error}
          </div>
        ) : assets.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No assets found matching the criteria.
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="block md:hidden">
              <div className="space-y-3 p-4">
                {assets.map((asset) => (
                  <Link
                    key={asset._id}
                    href={`/dashboard/assets/${asset._id}`}
                    className="block p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-mono font-semibold text-sm text-zinc-900 dark:text-zinc-50">{asset.assetCode}</div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">{asset.name}</div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                          asset.status === "Operational"
                            ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                            : asset.status === "Issue Reported"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                            : asset.status === "Under Maintenance"
                            ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                            : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                      <div><span className="font-medium">Category:</span> {asset.category}</div>
                      <div><span className="font-medium">Location:</span> {asset.location}</div>
                      <div><span className="font-medium">Condition:</span> {asset.condition || "Fair"}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                      View Details <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Asset Code</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Name</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Category</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Location</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Condition</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Status</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-250 dark:divide-zinc-800">
                  {assets.map((asset) => (
                    <tr key={asset._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                      <td className="px-6 py-4 font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                        {asset.assetCode}
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{asset.name}</td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{asset.category}</td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{asset.location}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {asset.condition || "Fair"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            asset.status === "Operational"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                              : asset.status === "Issue Reported"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                              : asset.status === "Under Maintenance"
                              ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                              : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/assets/${asset._id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
                        >
                          View Details <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
