"use client";

import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import { AlertCircle, Wrench, RefreshCw, CheckCircle2, User } from "lucide-react";

interface UserType {
  _id: string;
  name: string;
  email: string;
}

interface Issue {
  _id: string;
  issueNumber: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: string;
  reporterName: string;
  assignedTechnician?: UserType;
  asset?: {
    name: string;
    assetCode: string;
  };
  createdAt: string;
}

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [technicians, setTechnicians] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [selectedTech, setSelectedTech] = useState("");

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (selectedTech) params.assignedTechnician = selectedTech;

      const response = await api.get("/issues", { params });
      setIssues(response.data.issues || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch issues list");
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await api.get("/user");
      const allUsers = response.data.data || [];
      const techs = allUsers.filter((u: any) => u.role === "technician");
      setTechnicians(techs);
    } catch (err) {
      console.error("Failed to load technicians for dropdown", err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [status, priority, selectedTech]);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleAssignTechnician = async (issueId: string, techId: string) => {
    try {
      await api.put(`/issues/${issueId}/assign`, { assignedTechnician: techId || null });
      // Refresh list
      fetchIssues();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign technician");
    }
  };

  const statuses = [
    "Reported",
    "Assigned",
    "Inspection Started",
    "Maintenance In Progress",
    "Waiting for Parts",
    "Resolved",
    "Closed",
    "Reopened",
  ];

  const priorities = ["Low", "Medium", "High", "Critical"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Maintenance Faults
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Allocate task resources and track resolution updates
          </p>
        </div>
        <button
          onClick={fetchIssues}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex-1 sm:flex-initial rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="flex-1 sm:flex-initial rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="">All Priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={selectedTech}
          onChange={(e) => setSelectedTech(e.target.value)}
          className="flex-1 sm:flex-initial rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="">All Assignees</option>
          {technicians.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Issues Display */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        {loading && issues.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">Fetching issues...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">Error: {error}</div>
        ) : issues.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No issues matching criteria.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Issue #</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Asset</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Description</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Priority</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Status</th>
                    <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Assign Technician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-250 dark:divide-zinc-800">
                  {issues.map((issue) => (
                    <tr
                      key={issue._id}
                      className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 ${
                        issue.priority === "Critical" && issue.status !== "Resolved" && issue.status !== "Closed"
                          ? "bg-red-50/20 dark:bg-red-950/5"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-zinc-50">
                        {issue.issueNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {issue.asset?.name || "Deleted Asset"}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">
                          {issue.asset?.assetCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1">{issue.title}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">{issue.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            issue.priority === "Critical"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900"
                              : issue.priority === "High"
                              ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {issue.priority === "Critical" && <AlertCircle className="h-3.5 w-3.5" />}
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            issue.status === "Resolved"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                              : issue.status === "Closed"
                              ? "bg-zinc-50 text-zinc-500 dark:bg-zinc-950/30 dark:text-zinc-500"
                              : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {issue.status === "Closed" ? (
                          <span className="text-xs text-zinc-400">Locked (Closed)</span>
                        ) : (
                          <select
                            value={issue.assignedTechnician?._id || ""}
                            onChange={(e) => handleAssignTechnician(issue._id, e.target.value)}
                            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                          >
                            <option value="">Unassigned</option>
                            {technicians.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden">
              <div className="space-y-3 p-4">
                {issues.map((issue) => (
                  <div
                    key={issue._id}
                    className={`p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg ${
                      issue.priority === "Critical" && issue.status !== "Resolved" && issue.status !== "Closed"
                        ? "bg-red-50/30 dark:bg-red-950/10"
                        : "bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-50">
                          {issue.issueNumber}
                        </div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">{issue.title}</div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                          issue.priority === "Critical"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                            : issue.priority === "High"
                            ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 pb-3 border-b border-zinc-200 dark:border-zinc-700">
                      <div className="mb-1"><strong>Asset:</strong> {issue.asset?.name || "Deleted Asset"}</div>
                      <div className="font-mono text-xs text-zinc-400">{issue.asset?.assetCode}</div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Description</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">{issue.description}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Status</div>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
                              issue.status === "Resolved"
                                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                : issue.status === "Closed"
                                ? "bg-zinc-50 text-zinc-500 dark:bg-zinc-950/30 dark:text-zinc-500"
                                : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                            }`}
                          >
                            {issue.status}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Technician</div>
                          {issue.status === "Closed" ? (
                            <span className="text-xs text-zinc-400">Locked</span>
                          ) : (
                            <select
                              value={issue.assignedTechnician?._id || ""}
                              onChange={(e) => handleAssignTechnician(issue._id, e.target.value)}
                              className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                            >
                              <option value="">Unassigned</option>
                              {technicians.map((t) => (
                                <option key={t._id} value={t._id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
