"use client";

import React, { useState, useEffect } from "react";
import api from "../../../../lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Copy, ExternalLink, Calendar, MapPin, User, Tag, Clock } from "lucide-react";

interface Asset {
  _id: string;
  name: string;
  assetCode: string;
  category: string;
  location: string;
  condition: string;
  status: string;
  assignedTechnician?: {
    _id: string;
    name: string;
    email: string;
  };
  lastServiceDate?: string;
  nextServiceDate?: string;
  createdAt: string;
}

interface HistoryItem {
  _id: string;
  action: string;
  actor?: {
    name: string;
    email: string;
    role: string;
  };
  relatedIssue?: {
    issueNumber: string;
    title: string;
    status: string;
  };
  timestamp: string;
}

export default function AssetDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch asset details
      const assetRes = await api.get(`/assets/${id}`);
      const assetData = assetRes.data.asset;
      setAsset(assetData);

      // Fetch asset history
      try {
        const historyRes = await api.get(`/assets/${id}/history`);
        setHistory(historyRes.data.history || []);
      } catch (err) {
        console.error("Failed to load asset history logs", err);
      }

      // Fetch QR Code (base64)
      try {
        const qrRes = await api.get(`/assets/qr/${assetData.assetCode}?format=base64`);
        setQrCode(qrRes.data.qrCode);
      } catch (err) {
        console.error("Failed to fetch asset QR code", err);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleCopyLink = () => {
    if (!asset) return;
    const publicUrl = `${window.location.origin}/asset/${asset.assetCode}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCode || !asset) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `QR-${asset.assetCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-medium text-zinc-500">Loading asset details...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/assets" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Inventory
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-950/20 dark:bg-red-950/20">
          <h2 className="font-semibold">Error Loading Asset</h2>
          <p className="mt-1 text-sm">{error || "Asset not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/assets"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Inventory
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-150 pb-4 dark:border-zinc-800 gap-2">
              <div>
                <span className="text-xs font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                  {asset.assetCode}
                </span>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
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

            {/* Properties Grid */}
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
                <User className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                  <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase">Assigned Tech</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {asset.assignedTechnician ? asset.assignedTechnician.name : "Unassigned"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-150 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                  <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase">Last Service</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{formatDate(asset.lastServiceDate)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                  <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase">Next Service</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{formatDate(asset.nextServiceDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* History Timeline */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 space-y-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Asset History Timeline
            </h2>

            {history.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No history events logged for this asset.</p>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {history.map((item, idx) => (
                    <li key={item._id}>
                      <div className="relative pb-8">
                        {idx !== history.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center ring-8 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
                              <span className="h-2.5 w-2.5 rounded-full bg-zinc-600 dark:bg-zinc-400" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                {item.action}
                              </p>
                              {item.actor && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                  by {item.actor.name} ({item.actor.role})
                                </p>
                              )}
                              {item.relatedIssue && (
                                <div className="mt-1.5 rounded-lg border border-zinc-100 bg-zinc-50/50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950/20">
                                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                                    {item.relatedIssue.issueNumber}
                                  </span>
                                  : {item.relatedIssue.title} (
                                  <span className="italic text-zinc-500">{item.relatedIssue.status}</span>)
                                </div>
                              )}
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                              {formatTime(item.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* QR Code & Public Links Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 text-center space-y-6">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Asset QR Identifier
            </h2>

            {/* QR Preview */}
            <div className="mx-auto w-48 h-48 border border-zinc-150 rounded-xl bg-zinc-50 flex items-center justify-center overflow-hidden p-2 dark:border-zinc-800 dark:bg-zinc-950">
              {qrCode ? (
                <img src={qrCode} alt="Asset QR Code" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-zinc-400">Loading QR...</span>
              )}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Scan QR to report an issue or view public asset specifications without login.
            </p>

            {/* Action buttons */}
            <div className="space-y-2 pt-2 border-t border-zinc-150 dark:border-zinc-800">
              <button
                onClick={handleDownloadQR}
                disabled={!qrCode}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download QR Code
              </button>

              <button
                onClick={handleCopyLink}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <Copy className="h-4 w-4" /> {copied ? "Copied Link!" : "Copy Public Link"}
              </button>

              <Link
                href={`/asset/${asset.assetCode}`}
                target="_blank"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <ExternalLink className="h-4 w-4" /> Open Public Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
