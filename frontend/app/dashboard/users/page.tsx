"use client";

import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import { AlertCircle, Trash2, Mail, Phone, Shield } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "technician";
  createdAt: string;
}

export default function TechniciansPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<"" | "admin" | "technician">("");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/user");
      setUsers(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = filterRole ? users.filter((u) => u.role === filterRole) : users;

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/user/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-medium text-zinc-500">Loading technicians...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Technicians & Users
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage system users and technician assignments
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="mb-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilterRole("")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterRole === ""
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          All ({users.length})
        </button>
        <button
          onClick={() => setFilterRole("technician")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterRole === "technician"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          Technicians ({users.filter((u) => u.role === "technician").length})
        </button>
        <button
          onClick={() => setFilterRole("admin")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterRole === "admin"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          Admins ({users.filter((u) => u.role === "admin").length})
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">Role</th>
              <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">Joined</th>
              <th className="px-6 py-3 text-center font-semibold text-zinc-900 dark:text-zinc-50">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{user.name}</td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                      }`}
                    >
                      <Shield className="h-3 w-3" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
