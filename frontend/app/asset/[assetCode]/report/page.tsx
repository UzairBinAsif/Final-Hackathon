"use client";

import React, { useState, useEffect } from "react";
import api from "../../../../lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, AlertCircle, CheckCircle, Info } from "lucide-react";

interface Asset {
  name: string;
  assetCode: string;
  category: string;
}

interface TriageResult {
  title: string;
  category: string;
  priority: string;
  possibleCauses: string[];
  initialChecks: string[];
  recurringWarning?: string;
}

export default function ReportIssuePage() {
  const params = useParams();
  const assetCode = params.assetCode as string;
  const router = useRouter();

  // Page States
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [complaintText, setComplaintText] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [analysisStarted, setAnalysisStarted] = useState(false);

  // AI & Triage states
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [triageError, setTriageError] = useState<string | null>(null);

  // Editable Form fields (populated by AI or manual input)
  const [finalTitle, setFinalTitle] = useState("");
  const [finalCategory, setFinalCategory] = useState("Electrical");
  const [finalPriority, setFinalPriority] = useState("Medium");
  const [finalDescription, setFinalDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetData = async () => {
      if (!assetCode) return;
      try {
        const response = await api.get(`/public/asset/${assetCode}`);
        setAsset(response.data.asset);
        // Default category from asset type
        if (response.data.asset) {
          setFinalCategory(response.data.asset.category);
        }
      } catch (err) {
        console.error("Failed to load asset context for reporting", err);
      } finally {
        setLoadingAsset(false);
      }
    };
    fetchAssetData();
  }, [assetCode]);

  const handleAnalyzeAI = async () => {
    if (!complaintText.trim() || !reporterName.trim() || !reporterContact.trim() || !reporterEmail.trim()) {
      setTriageError("Please provide your name, phone number, email, and issue description before analyzing.");
      return;
    }

    setTriageLoading(true);
    setTriageError(null);
    setTriageResult(null);
    setAnalysisStarted(true);

    try {
      const payload = {
        assetType: asset?.name || "Equipment",
        assetCategory: asset?.category || "",
        complaintText: complaintText.trim(),
      };

      const response = await api.post("/ai/triage", payload);
      const triage: TriageResult = response.data.triage;

      setTriageResult(triage);
      setFinalTitle(triage.title || "");
      setFinalCategory(triage.category || asset?.category || "Electrical");
      setFinalPriority(triage.priority || "Medium");
      setFinalDescription(complaintText.trim());
    } catch (err: any) {
      console.error("AI Triage failed, activating fallback", err);
      setTriageError("AI Analysis was unavailable, but you can fill out the form manually below.");
      // Fallback state
      setFinalTitle(`Issue with ${asset?.name || "Equipment"}`);
      setFinalCategory(asset?.category || "Electrical");
      setFinalPriority("Medium");
      setFinalDescription(complaintText.trim());
    } finally {
      setTriageLoading(false);
    }
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const payload = {
        title: finalTitle.trim(),
        description: finalDescription.trim(),
        category: finalCategory,
        priority: finalPriority,
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail.trim().toLowerCase(),
        reporterContact: reporterContact.trim(),
      };

      await api.post(`/public/issues/${assetCode}`, payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push(`/asset/${assetCode}`);
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "Failed to submit issue. Please check fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["Electrical", "Mechanical", "Plumbing", "HVAC", "Infrastructure", "Safety", "Other"];
  const priorities = ["Low", "Medium", "High", "Critical"];

  if (loadingAsset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-sm font-medium text-zinc-500">Loading reporting portal...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 font-sans">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
          <Link href={`/asset/${assetCode}`} className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-50">
            <ArrowLeft className="h-4 w-4" /> Back to Asset
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Report Issue
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Submit a maintenance issue for <span className="font-semibold text-zinc-700 dark:text-zinc-300">{asset?.name || assetCode}</span>
          </p>
        </div>

        {submitSuccess && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 flex items-start gap-3 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold">Issue Reported Successfully!</h4>
              <p className="mt-1">The operations desk has been notified. Redirecting back to specifications...</p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold">Submission Failed</h4>
              <p className="mt-1">{submitError}</p>
            </div>
          </div>
        )}

        {!submitSuccess && (
          <div className="space-y-6">
            {!analysisStarted && (
              <div className="space-y-6">
                {/* Step 1: Complaint Prompt */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="e.g. Jane Smith"
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={reporterContact}
                        onChange={(e) => setReporterContact(e.target.value)}
                        placeholder="e.g. +1 555 0100"
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                        placeholder="e.g. jane@example.com"
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Describe what is wrong (Plain text)
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      placeholder="e.g. The motor makes a loud screeching noise when started and there is a mild smell of burnt rubber coming from the drive belt."
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAnalyzeAI}
                      disabled={triageLoading || !complaintText.trim() || !reporterName.trim() || !reporterContact.trim() || !reporterEmail.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      {triageLoading ? "Analyzing with AI..." : "Analyze with AI"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Form Triage Results (either AI generated or manual edit) */}
            {(analysisStarted && (triageResult || triageError || finalTitle)) && (
              <form onSubmit={handleSubmitIssue} className="border-t border-zinc-150 pt-6 dark:border-zinc-800 space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/20">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                    Reporter Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-lg bg-white px-3 py-2 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                      <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Name</div>
                      <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">{reporterName || "Not provided"}</div>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                      <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Phone</div>
                      <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">{reporterContact || "Not provided"}</div>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                      <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email</div>
                      <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-50 break-all">{reporterEmail || "Not provided"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 dark:bg-zinc-950/20 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-zinc-500" />
                    Issue Details Setup
                  </h3>

                  {triageError && (
                    <p className="text-xs text-amber-600 mb-3 font-medium">{triageError}</p>
                  )}

                  {triageResult?.recurringWarning && (
                    <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900">
                      <strong className="block mb-0.5">Safety Warning:</strong>
                      {triageResult.recurringWarning}
                    </div>
                  )}

                  {triageResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs border-b border-zinc-200 pb-4 dark:border-zinc-800">
                      <div>
                        <strong className="block text-zinc-500 uppercase tracking-wide mb-1">Possible Causes:</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-700 dark:text-zinc-400">
                          {triageResult.possibleCauses.map((cause, idx) => (
                            <li key={idx}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="block text-zinc-500 uppercase tracking-wide mb-1">Suggested Initial Checks:</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-700 dark:text-zinc-400">
                          {triageResult.initialChecks.map((check, idx) => (
                            <li key={idx}>{check}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Issue Title (Suggested)
                      </label>
                      <input
                        type="text"
                        required
                        value={finalTitle}
                        onChange={(e) => setFinalTitle(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                          Category
                        </label>
                        <select
                          value={finalCategory}
                          onChange={(e) => setFinalCategory(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                          Priority
                        </label>
                        <select
                          value={finalPriority}
                          onChange={(e) => setFinalPriority(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
                        >
                          {priorities.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Detailed Description
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={finalDescription}
                        onChange={(e) => setFinalDescription(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:bg-zinc-950 dark:focus:border-zinc-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-150 dark:border-zinc-800">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Issue"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
