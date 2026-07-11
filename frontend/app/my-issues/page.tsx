"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { useRouter } from "next/navigation";
import { LogOut, Wrench, AlertTriangle, CheckCircle2, Clock, Play, HelpCircle, Package, Send, X } from "lucide-react";

interface Issue {
  _id: string;
  issueNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  asset: {
    _id: string;
    name: string;
    assetCode: string;
    location: string;
  };
}

export default function MyIssuesPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Maintenance Resolve Modal States
  const [resolvingIssue, setResolvingIssue] = useState<Issue | null>(null);
  const [maintNotes, setMaintNotes] = useState("");
  const [maintParts, setMaintParts] = useState("");
  const [maintCost, setMaintCost] = useState("0");
  const [maintTime, setMaintTime] = useState("");
  const [maintSubmitting, setMaintSubmitting] = useState(false);
  const [maintError, setMaintError] = useState<string | null>(null);

  const fetchMyIssues = async () => {
    if (!user) return;
    setFetching(true);
    setError(null);
    try {
      // Query issues assigned to the technician
      const response = await api.get("/issues", {
        params: { assignedTechnician: user.id },
      });
      setIssues(response.data.issues || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch your assigned issues.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user && user.role === "admin") {
      router.push("/dashboard");
    } else if (user) {
      fetchMyIssues();
    }
  }, [user, loading, router]);

  if (loading || fetching && issues.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-sm font-medium text-zinc-500">Loading workspace...</div>
      </div>
    );
  }

  if (!user || user.role !== "technician") {
    return null; // Route guards
  }

  const handleStatusTransition = async (issueId: string, nextStatus: string) => {
    try {
      await api.put(`/issues/${issueId}/status`, { status: nextStatus });
      fetchMyIssues();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to transition status to ${nextStatus}`);
    }
  };

  const handleOpenResolveModal = (issue: Issue) => {
    setResolvingIssue(issue);
    setMaintNotes("");
    setMaintParts("");
    setMaintCost("0");
    setMaintTime("");
    setMaintError(null);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue) return;
    setMaintError(null);

    const costNum = parseFloat(maintCost);
    if (isNaN(costNum) || costNum < 0) {
      setMaintError("Cost must be a non-negative number.");
      return;
    }

    if (!maintNotes.trim() || !maintTime.trim()) {
      setMaintError("Notes and Time Taken are required.");
      return;
    }

    setMaintSubmitting(true);
    try {
      const partsArray = maintParts
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      // 1. Log Maintenance record
      await api.post(`/issues/${resolvingIssue._id}/maintenance`, {
        notes: maintNotes.trim(),
        partsUsed: partsArray,
        cost: costNum,
        timeTaken: maintTime.trim(),
      });

      // 2. Update issue status to Resolved
      await api.put(`/issues/${resolvingIssue._id}/status`, {
        status: "Resolved",
        maintenanceNote: maintNotes.trim(),
      });

      setResolvingIssue(null);
      fetchMyIssues();
    } catch (err: any) {
      setMaintError(err.response?.data?.message || "Failed to resolve issue. Please verify fields.");
    } finally {
      setMaintSubmitting(false);
    }
  };

  // State transitions config helper
  const getAllowedTransitions = (currentStatus: string) => {
    const validTransitions: any = {
      Reported: ["Inspection Started", "Closed"],
      Assigned: ["Inspection Started", "Maintenance In Progress", "Waiting for Parts", "Closed"],
      "Inspection Started": ["Maintenance In Progress", "Waiting for Parts", "Closed"],
      "Maintenance In Progress": ["Waiting for Parts", "Closed"],
      "Waiting for Parts": ["Maintenance In Progress", "Closed"],
      Resolved: ["Closed", "Reopened"],
      Closed: ["Reopened"],
      Reopened: ["Inspection Started", "Maintenance In Progress", "Waiting for Parts", "Closed"],
    };
    return validTransitions[currentStatus] || [];
  };

  const getTransitionLabel = (status: string) => {
    switch (status) {
      case "Inspection Started":
        return "Start Inspection";
      case "Maintenance In Progress":
        return "Start Maintenance";
      case "Waiting for Parts":
        return "Wait for Parts";
      case "Closed":
        return "Close Task";
      case "Reopened":
        return "Reopen Task";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between px-8">
        <div className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-zinc-50">
          <Wrench className="h-5 w-5" />
          <span>MaintainIQ Workspace</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{user.name}</div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500 uppercase font-semibold">{user.role}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-zinc-850 dark:hover:bg-red-950/20 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Assigned Incidents
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage issues allocated to your queue and submit resolution maintenance reports
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {issues.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800">
            No active incidents assigned to you.
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => {
              const transitions = getAllowedTransitions(issue.status);
              const isResolvedOrClosed = issue.status === "Resolved" || issue.status === "Closed";

              return (
                <div
                  key={issue._id}
                  className="bg-white rounded-xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 space-y-4"
                >
                  {/* Issue ID and Status bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-50">
                        {issue.issueNumber}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          issue.priority === "Critical"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                            : issue.priority === "High"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-850 dark:text-zinc-300"
                        }`}
                      >
                        {issue.priority} Priority
                      </span>
                    </div>
                    <span
                      className={`inline-flex self-start sm:self-auto items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        issue.status === "Resolved"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : issue.status === "Closed"
                          ? "bg-zinc-50 text-zinc-500"
                          : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </div>

                  {/* Asset Details info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-xs font-semibold text-zinc-400 uppercase">Equipment Name</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {issue.asset?.name || "Deleted Asset"}
                      </span>
                      <span className="block font-mono text-xs text-zinc-400 mt-0.5">
                        {issue.asset?.assetCode}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-zinc-400 uppercase">Location</span>
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {issue.asset?.location || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Incident Description */}
                  <div className="text-sm">
                    <span className="block text-xs font-semibold text-zinc-400 uppercase">Description</span>
                    <strong className="block text-zinc-800 dark:text-zinc-200 mt-0.5">{issue.title}</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1">{issue.description}</p>
                  </div>

                  {/* Actions buttons */}
                  {!isResolvedOrClosed && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      {transitions.map((t: string) => (
                        <button
                          key={t}
                          onClick={() => handleStatusTransition(issue._id, t)}
                          className="rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-855 cursor-pointer"
                        >
                          {getTransitionLabel(t)}
                        </button>
                      ))}

                      {/* Explicit Resolve Option */}
                      {(issue.status === "Inspection Started" ||
                        issue.status === "Maintenance In Progress" ||
                        issue.status === "Waiting for Parts") && (
                        <button
                          onClick={() => handleOpenResolveModal(issue)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Resolve Issue
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Resolve Issue Modal */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-zinc-200 p-6 shadow-xl dark:bg-zinc-900 dark:border-zinc-850 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400">{resolvingIssue.issueNumber}</span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">Submit Resolution Report</h3>
              </div>
              <button
                onClick={() => setResolvingIssue(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>

            {maintError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
                {maintError}
              </div>
            )}

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Resolution Notes (Required)
                </label>
                <textarea
                  rows={3}
                  required
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                  placeholder="Describe details of work done, cleaning, calibrating, or replacements..."
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Time Taken (Required)
                  </label>
                  <input
                    type="text"
                    required
                    value={maintTime}
                    onChange={(e) => setMaintTime(e.target.value)}
                    placeholder="e.g. 45 mins or 2 hours"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Expense Cost ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="any"
                    value={maintCost}
                    onChange={(e) => setMaintCost(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Parts Used (Comma separated)
                </label>
                <input
                  type="text"
                  value={maintParts}
                  onChange={(e) => setMaintParts(e.target.value)}
                  placeholder="e.g. O-Ring, Grease, Spark Plug"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setResolvingIssue(null)}
                  className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={maintSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  {maintSubmitting ? "Submitting..." : "Submit & Resolve"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
