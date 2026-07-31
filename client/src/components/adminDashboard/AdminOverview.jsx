import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/ApiConfig";

const AdminOverview = () => {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [progressFilter, setProgressFilter] = useState("all");
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    const loadManagers = async () => {
      try {
        const response = await api.get("/admin/manager-progress");
        setManagers(response.data.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load manager progress.");
      } finally {
        setIsLoadingManagers(false);
      }
    };

    loadManagers();
  }, []);

  const completedManagers = managers.filter((manager) => manager.progress >= 100).length;
  const pendingManagers = managers.length - completedManagers;

  const visibleManagers = managers.filter((manager) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      manager.fullName?.toLowerCase().includes(q) ||
      manager.email?.toLowerCase().includes(q) ||
      manager.restaurantName?.toLowerCase().includes(q);

    const matchesFilter =
      progressFilter === "all" ||
      (progressFilter === "complete" && manager.progress >= 100) ||
      (progressFilter === "pending" && manager.progress < 100);

    return matchesSearch && matchesFilter;
  });

  const openSelectedManagerMenu = () => {
    if (!selectedManager?.restaurantId) return;
    navigate(`/restaurant-menu/${selectedManager.restaurantId}`);
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Overview</h2>
          <p className="text-sm text-(--color-neutral)">
            A quick snapshot of restaurant manager progress and profile health.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-2xl bg-(--color-base-200) px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-(--color-neutral)">Total</p>
            <p className="mt-1 text-lg font-black">{managers.length}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Complete</p>
            <p className="mt-1 text-lg font-black text-emerald-700">{completedManagers}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Pending</p>
            <p className="mt-1 text-lg font-black text-amber-700">{pendingManagers}</p>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold">Restaurant Manager Progress</h3>
            <p className="text-sm text-(--color-neutral)">
              Restaurant profile is 50%; adding one or more menu items is the remaining 50%.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search managers..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              {[
                { id: "all", label: "All" },
                { id: "complete", label: "Complete" },
                { id: "pending", label: "Pending" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setProgressFilter(filter.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    progressFilter === filter.id
                      ? "bg-(--color-primary) text-white"
                      : "bg-orange-50 text-slate-700 hover:bg-orange-100"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoadingManagers ? (
          <p className="text-(--color-neutral)">Loading managers...</p>
        ) : error ? (
          <p className="text-(--color-error)">{error}</p>
        ) : visibleManagers.length === 0 ? (
          <p className="text-(--color-neutral)">No restaurant managers found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visibleManagers.map((manager) => (
              <article
                key={manager.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedManager(manager)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedManager(manager);
                  }
                }}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-(--color-base-200) p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <img
                    src={manager.photo?.url || "/userImage.jpg"}
                    alt={manager.fullName}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold truncate">{manager.fullName}</h4>
                    <p className="text-sm text-(--color-neutral) truncate">{manager.email}</p>
                    <p className="text-sm text-(--color-neutral) truncate">{manager.restaurantName}</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-900 shadow-sm">
                    {manager.progress}%
                  </div>
                </div>

                <div className="flex justify-between gap-3 text-sm mb-2">
                  <span>{manager.menuItemCount} menu items</span>
                  <span className="font-bold">{manager.progress}% complete</span>
                </div>

                <div className="h-2 rounded-full bg-(--color-base-300) overflow-hidden">
                  <div
                    className="h-full bg-(--color-primary) transition-all duration-300"
                    style={{ width: `${manager.progress}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className={`rounded-full px-3 py-1 ${manager.profileComplete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {manager.profileComplete ? "Profile complete" : "Profile pending"}
                  </span>
                  <span className={`rounded-full px-3 py-1 ${manager.menuItemCount ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {manager.menuItemCount ? "Menu added" : "Menu pending"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedManager ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6"
          onClick={() => setSelectedManager(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <img
                src={selectedManager.photo?.url || "/userImage.jpg"}
                alt={selectedManager.fullName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-orange-100"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-neutral)">
                  Manager details
                </p>
                <h3 className="mt-1 truncate text-2xl font-black text-slate-900">
                  {selectedManager.fullName}
                </h3>
                <p className="truncate text-sm text-slate-600">{selectedManager.email}</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                  {selectedManager.restaurantName}
                </p>
              </div>
              <button
                onClick={() => setSelectedManager(null)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-700">Progress</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{selectedManager.progress}%</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Menu items</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{selectedManager.menuItemCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-600">Profile</p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {selectedManager.profileComplete ? "Complete" : "Pending"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedManager.isActive ? "Active restaurant" : "Inactive restaurant"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className={`rounded-full px-3 py-1 ${selectedManager.profileComplete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {selectedManager.profileComplete ? "Profile complete" : "Profile pending"}
                </span>
                <span className={`rounded-full px-3 py-1 ${selectedManager.menuItemCount ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {selectedManager.menuItemCount ? "Menu added" : "Menu pending"}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={openSelectedManagerMenu}
                  disabled={!selectedManager.restaurantId}
                  className="rounded-full bg-(--color-primary) px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Open menu
                </button>
                <button
                  onClick={() => setSelectedManager(null)}
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

export default AdminOverview;
