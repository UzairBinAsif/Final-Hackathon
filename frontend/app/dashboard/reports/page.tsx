"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import { AlertCircle, FileText, CalendarDays, User, Phone, Mail, Building2 } from "lucide-react";

interface ReportItem {
  _id: string;
  issueNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  reporterName: string;
  reporterEmail: string;
  reporterContact: string;
  createdAt: string;
  asset?: {
    name: string;
    assetCode: string;
  };
  assignedTechnician?: {
    name: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/issues");
        setReports(response.data.issues || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load reports history");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Reports</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            History of who reported which asset, when, and the contact details saved with each issue.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <div className="font-semibold text-zinc-900 dark:text-zinc-50">Total Reports</div>
          <div className="text-2xl font-bold">{reports.length}</div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="mb-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading reports history...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                <tr>
                  <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Report</th>
                  <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Reporter</th>
                  <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Asset</th>
                  <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Reported At</th>
                  <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/40">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-zinc-100 p-2 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-50">{report.issueNumber}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{report.title}</div>
                          <div className="mt-1 text-xs text-zinc-400">{report.category} · {report.priority}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-zinc-600 dark:text-zinc-300">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" />
                        {report.reporterName}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Mail className="h-3.5 w-3.5" />
                        {report.reporterEmail}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Phone className="h-3.5 w-3.5" />
                        {report.reporterContact}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-zinc-600 dark:text-zinc-300">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-zinc-400" />
                        {report.asset?.name || "Deleted Asset"}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        {report.asset?.assetCode}
                      </div>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {report.assignedTechnician ? `Assigned to ${report.assignedTechnician.name}` : "Unassigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-zinc-400" />
                        {formatDateTime(report.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}