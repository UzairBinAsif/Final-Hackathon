"use client";

import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Wrench, MapPin, Tag, Clock, Calendar, AlertTriangle } from "lucide-react";

interface Asset {
  name: string;
  assetCode: string;
  category: string;
  location: string;
  condition: string;
  status: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
}

export default function PublicAssetPage() {
  const params = useParams();
  const assetCode = params.assetCode as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetData = async () => {
      if (!assetCode) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/public/asset/${assetCode}`);
        setAsset(response.data.asset);
      } catch (err: any) {
        setError(err.response?.data?.message || "Asset not found or access denied.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssetData();
  }, [assetCode]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-sm font-medium text-zinc-500">Loading asset specifications...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-950/20 dark:bg-red-950/20">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold">Asset Not Found</h1>
          <p className="mt-2 text-sm">{error || "The requested asset code does not exist."}</p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Go to Portal Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 font-sans">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-150 pb-6 dark:border-zinc-800 gap-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
              {asset.assetCode}
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
              {asset.name}
            </h1>
          </div>
          <div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
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
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-zinc-400 mt-0.5" />
            <div>
              <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase">Category</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{asset.category}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-zinc-400 mt-0.5" />
            <div>
              <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase">Location</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{asset.location}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-zinc-400 mt-0.5" />
            <div>
              <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase">Condition</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{asset.condition}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-zinc-400 mt-0.5" />
            <div>
              <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase">Last Service</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{formatDate(asset.lastServiceDate)}</span>
            </div>
          </div>
        </div>

        {/* Action area */}
        <div className="pt-6 border-t border-zinc-150 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <span className="text-xs text-zinc-400 text-center sm:text-left">
            Notice: If this equipment is malfunctioning, please report it immediately.
          </span>
          <Link
            href={`/asset/${asset.assetCode}/report`}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Wrench className="h-4 w-4" /> Report an Issue
          </Link>
        </div>
      </div>
    </div>
  );
}
