import React, { useEffect, useMemo, useState } from "react";
import api from "../../config/ApiConfig";

const userTypeStyles = {
  customer: "bg-sky-50 text-sky-700",
  restaurant: "bg-orange-50 text-orange-700",
  rider: "bg-emerald-50 text-emerald-700",
  admin: "bg-slate-100 text-slate-700",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const getInitials = (value = "") =>
  String(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get("/admin/data-collections");
        setUsers(response.data?.data?.users || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load users.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const typeCounts = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.total += 1;
        acc[user.userType] = (acc[user.userType] || 0) + 1;
        return acc;
      },
      { total: 0, customer: 0, restaurant: 0, rider: 0, admin: 0 },
    );
  }, [users]);

  const visibleUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.fullName?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q) ||
        user.userType?.toLowerCase().includes(q);

      const matchesType = typeFilter === "all" || user.userType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [users, searchTerm, typeFilter]);

  const copyEmail = async (email) => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
    } catch (clipboardError) {
      console.error("Could not copy email:", clipboardError);
    }
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users Management</h2>
          <p className="text-sm text-(--color-neutral)">
            Browse every account imported from the project database or legacy JSON.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-2xl bg-(--color-base-200) px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-(--color-neutral)">Total</p>
            <p className="mt-1 text-lg font-black">{typeCounts.total}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Customers</p>
            <p className="mt-1 text-lg font-black text-sky-700">{typeCounts.customer}</p>
          </div>
          <div className="rounded-2xl bg-orange-50 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-orange-700">Restaurants</p>
            <p className="mt-1 text-lg font-black text-orange-700">{typeCounts.restaurant}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Riders</p>
            <p className="mt-1 text-lg font-black text-emerald-700">{typeCounts.rider}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "customer", label: "Customer" },
            { id: "restaurant", label: "Restaurant" },
            { id: "rider", label: "Rider" },
            { id: "admin", label: "Admin" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTypeFilter(filter.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                typeFilter === filter.id
                  ? "bg-(--color-primary) text-white"
                  : "bg-orange-50 text-slate-700 hover:bg-orange-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading users...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-xl font-black text-slate-900">Live Users List</h3>
            <p className="text-sm text-slate-500">
              {visibleUsers.length} visible of {users.length} total
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user) => (
                    <tr
                      key={user._id || user.id}
                      className="border-b border-slate-100 transition hover:bg-orange-50/60"
                    >
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="grid h-11 w-11 place-items-center rounded-full bg-orange-100 font-black text-orange-700">
                            {getInitials(user.fullName)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.fullName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            userTypeStyles[user.userType] || userTypeStyles.admin
                          }`}
                        >
                          {user.userType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-700">Registered</span>
                          <span className="text-xs text-slate-500">{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className="rounded-full bg-(--color-primary) px-3 py-1.5 text-xs font-bold text-white"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => copyEmail(user.email)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            Copy Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <img
                src={selectedUser.photo?.url || "/userImage.jpg"}
                alt={selectedUser.fullName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-orange-100"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-neutral)">
                  User details
                </p>
                <h3 className="mt-1 truncate text-2xl font-black text-slate-900">
                  {selectedUser.fullName}
                </h3>
                <p className="truncate text-sm text-slate-600">{selectedUser.email}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{selectedUser.phone}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Type</p>
                <p className="mt-2 text-lg font-black text-slate-900">{selectedUser.userType}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Joined</p>
                <p className="mt-2 text-lg font-black text-slate-900">{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-600">Account</p>
                <p className="mt-2 text-lg font-black text-slate-900">Active</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className={`rounded-full px-3 py-1 ${userTypeStyles[selectedUser.userType] || userTypeStyles.admin}`}>
                  {selectedUser.userType}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                  Account ready
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyEmail(selectedUser.email)}
                  className="rounded-full bg-(--color-primary) px-4 py-2 text-sm font-bold text-white"
                >
                  Copy Email
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  Keep viewing
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminUsers;
