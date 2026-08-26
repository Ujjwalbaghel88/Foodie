import React, { useEffect, useMemo, useState } from "react";
import api from "../../config/ApiConfig";

const collectionConfig = {
  users: {
    title: "Users",
    subtitle: "Customer, restaurant, rider and admin accounts",
    columns: ["Name", "Email", "Type", "Phone"],
  },
  restaurants: {
    title: "Restaurants",
    subtitle: "Restaurant profiles imported from the JSON files",
    columns: ["Name", "City", "Cuisine", "Rating"],
  },
  menuitems: {
    title: "Menu Items",
    subtitle: "Restaurant menu collections",
    columns: ["Restaurant", "Items", "Updated"],
  },
  customers: {
    title: "Customers",
    subtitle: "Customer profiles and addresses",
    columns: ["User", "Addresses", "Active"],
  },
  riders: {
    title: "Riders",
    subtitle: "Delivery partner profiles",
    columns: ["User", "Vehicle", "Available"],
  },
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const getInitials = (value = "") =>
  String(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

const badgeStyles = {
  customer: "bg-sky-50 text-sky-700",
  restaurant: "bg-orange-50 text-orange-700",
  rider: "bg-emerald-50 text-emerald-700",
  admin: "bg-slate-100 text-slate-700",
  legacy: "bg-violet-50 text-violet-700",
};

const AdminDataViewer = () => {
  const [data, setData] = useState({});
  const [counts, setCounts] = useState({});
  const [source, setSource] = useState({});
  const [activeCollection, setActiveCollection] = useState("restaurants");
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedRow, setSelectedRow] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get("/admin/data-collections");
        setData(response.data?.data || {});
        setCounts(response.data?.counts || {});
        setSource(response.data?.source || {});
        setActiveCollection((prev) => prev || "restaurants");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load data collections.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const collections = useMemo(
    () => Object.keys(collectionConfig).map((key) => ({
      key,
      ...collectionConfig[key],
      count: counts[key] || 0,
      source: source[key] || "database",
    })),
    [counts, source],
  );

  const collectionRows = useMemo(
    () => (data[activeCollection] || []).map((row) => ({
      ...row,
      __collection: activeCollection,
      __source: source?.[activeCollection] || "database",
    })),
    [data, activeCollection, source],
  );

  const activeRows = useMemo(() => {
    const rows = collectionRows;
    const q = searchTerm.trim().toLowerCase();

    const matchesSearch = (row) => {
      if (!q) return true;
      const flattened = JSON.stringify(row).toLowerCase();
      return flattened.includes(q);
    };

    const matchesSource = (row) => {
      if (sourceFilter === "all") return true;
      if (sourceFilter === "database") return row?.__source === "database";
      if (sourceFilter === "legacy-json") return row?.__source === "legacy-json";
      return true;
    };

    return rows.filter((row) => matchesSearch(row) && matchesSource(row));
  }, [collectionRows, searchTerm, sourceFilter]);

  const activeConfig = collectionConfig[activeCollection];

  const visibleCollections = useMemo(
    () =>
      collections.map((item) => ({
        ...item,
        active: activeCollection === item.key,
      })),
    [collections, activeCollection],
  );

  const exportRows = activeRows;

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    downloadFile(
      `cravings-${activeCollection}.json`,
      JSON.stringify(exportRows, null, 2),
      "application/json",
    );
  };

  const handleExportCsv = () => {
    if (!exportRows.length) return;

    const keysByCollection = {
      users: ["fullName", "email", "userType", "phone"],
      restaurants: ["restaurantName", "city", "cuisineType", "rating", "numReviews"],
      menuitems: ["restaurantId", "items"],
      customers: ["userId", "addressBook", "isActive"],
      riders: ["userId", "vehicleDetails", "isAvailable"],
    };

    const keys = keysByCollection[activeCollection] || Object.keys(exportRows[0] || {});
    const header = keys.join(",");
    const lines = exportRows.map((row) =>
      keys
        .map((key) => {
          const value = row[key];
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return `"${JSON.stringify(value).replaceAll('"', '""')}"`;
          return `"${String(value).replaceAll('"', '""')}"`;
        })
        .join(","),
    );

    downloadFile(`cravings-${activeCollection}.csv`, [header, ...lines].join("\n"), "text/csv");
  };

  const handleResetActiveCollection = async () => {
    const confirmMessage = `Reset ${activeConfig.title} from the legacy JSON file?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setIsResetting(true);
      await api.post(`/admin/data-collections/${activeCollection}/reset`);
      const response = await api.get("/admin/data-collections");
      setData(response.data?.data || {});
      setCounts(response.data?.counts || {});
      setSource(response.data?.source || {});
      setSelectedRow(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not reset collection.");
    } finally {
      setIsResetting(false);
    }
  };

  const renderTableBody = () => {
    if (!activeRows.length) {
      return (
        <tr>
          <td colSpan={activeConfig.columns.length} className="py-10 text-center text-sm text-slate-500">
            No records available.
          </td>
        </tr>
      );
    }

    if (activeCollection === "users") {
      return activeRows.map((row) => (
        <tr
          key={row._id || row.id}
          className="border-b border-slate-100 hover:bg-orange-50/60 cursor-pointer"
          onClick={() => setSelectedRow(row)}
        >
          <td className="py-3 pr-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 font-black text-orange-700">
                {getInitials(row.fullName)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{row.fullName}</p>
                <p className="text-xs text-slate-500">{formatDate(row.createdAt)}</p>
              </div>
            </div>
          </td>
          <td className="py-3 pr-4 text-slate-600">{row.email}</td>
          <td className="py-3 pr-4">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyles[row.userType] || badgeStyles.legacy}`}>
              {row.userType}
            </span>
          </td>
          <td className="py-3 pr-4 text-slate-600">{row.phone || "-"}</td>
        </tr>
      ));
    }

    if (activeCollection === "restaurants") {
      return activeRows.map((row) => (
        <tr
          key={row._id || row.id}
          className="border-b border-slate-100 hover:bg-orange-50/60 cursor-pointer"
          onClick={() => setSelectedRow(row)}
        >
          <td className="py-3 pr-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 font-black text-amber-700">
                {getInitials(row.restaurantName)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{row.restaurantName}</p>
                <p className="text-xs text-slate-500">{row.isActive ? "Live" : "Inactive"}</p>
              </div>
            </div>
          </td>
          <td className="py-3 pr-4 text-slate-600">{row.city || "-"}</td>
          <td className="py-3 pr-4 text-slate-600">{row.cuisineType || "-"}</td>
          <td className="py-3 pr-4 text-slate-600">
            {Number(row.rating || 0).toFixed(1)} / {row.numReviews || 0}
          </td>
        </tr>
      ));
    }

    if (activeCollection === "menuitems") {
      return activeRows.map((row) => (
        <tr
          key={row._id || row.id}
          className="border-b border-slate-100 hover:bg-orange-50/60 cursor-pointer"
          onClick={() => setSelectedRow(row)}
        >
          <td className="py-3 pr-4">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">
                {row.restaurantId?.restaurantName || row.restaurantId?.toString?.() || "-"}
              </span>
              <span className="text-xs text-slate-500">
                {row.items?.[0]?.foodType || "menu"}
              </span>
            </div>
          </td>
          <td className="py-3 pr-4 text-slate-600">{row.items?.length || 0}</td>
          <td className="py-3 pr-4 text-slate-600">{formatDate(row.updatedAt || row.createdAt)}</td>
        </tr>
      ));
    }

    if (activeCollection === "customers") {
      return activeRows.map((row) => (
        <tr
          key={row._id || row.id}
          className="border-b border-slate-100 hover:bg-orange-50/60 cursor-pointer"
          onClick={() => setSelectedRow(row)}
        >
          <td className="py-3 pr-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 font-black text-sky-700">
                {getInitials(row.userId?.fullName || row.userId?.toString?.() || "")}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {row.userId?.fullName || row.userId?.toString?.() || "-"}
                </p>
                <p className="text-xs text-slate-500">
                  {row.userId?.email || "customer profile"}
                </p>
              </div>
            </div>
          </td>
          <td className="py-3 pr-4 text-slate-600">{row.addressBook?.length || 0}</td>
          <td className="py-3 pr-4 text-slate-600">{row.isActive ? "Active" : "Inactive"}</td>
        </tr>
      ));
    }

    if (activeCollection === "riders") {
      return activeRows.map((row) => (
        <tr
          key={row._id || row.id}
          className="border-b border-slate-100 hover:bg-orange-50/60 cursor-pointer"
          onClick={() => setSelectedRow(row)}
        >
          <td className="py-3 pr-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 font-black text-emerald-700">
                {getInitials(row.userId?.fullName || row.userId?.toString?.() || "")}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {row.userId?.fullName || row.userId?.toString?.() || "-"}
                </p>
                <p className="text-xs text-slate-500">
                  {row.vehicleDetails?.vehicleNumber || "rider"}
                </p>
              </div>
            </div>
          </td>
          <td className="py-3 pr-4 text-slate-600">
            {row.vehicleDetails?.vehicleType || "-"}{" "}
            {row.vehicleDetails?.vehicleNumber ? `(${row.vehicleDetails.vehicleNumber})` : ""}
          </td>
          <td className="py-3 pr-4 text-slate-600">{row.isAvailable ? "Yes" : "No"}</td>
        </tr>
      ));
    }

    return null;
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Viewer</h2>
          <p className="text-sm text-slate-500">
            Inspect the records imported from `cravingsDB.*.json`.
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-500">
          Active source: {source[activeCollection] || "database"}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-5 mb-6">
        {visibleCollections.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveCollection(item.key);
              setSelectedRow(null);
            }}
            className={`text-left rounded-2xl border p-4 transition ${
              item.active
                ? "border-(--color-primary) bg-orange-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {item.title}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">{item.count}</p>
            <p className="mt-1 text-xs text-slate-500">{item.source}</p>
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeConfig.title.toLowerCase()}...`}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
        >
          <option value="all">All sources</option>
          <option value="database">Database</option>
          <option value="legacy-json">Legacy JSON</option>
        </select>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCsv}
            disabled={!exportRows.length}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportJson}
            disabled={!exportRows.length}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export JSON
          </button>
          <button
            onClick={handleResetActiveCollection}
            disabled={isResetting}
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResetting ? "Resetting..." : `Reset ${activeConfig.title}`}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading data collections...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-xl font-black text-slate-900">{activeConfig.title}</h3>
            <p className="text-sm text-slate-500">
              {activeConfig.subtitle} - {exportRows.length} visible
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  {activeConfig.columns.map((column) => (
                    <th key={column} className="px-5 py-4">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>
        </div>
      )}

      {selectedRow && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                  {selectedRow.__collection}
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-900">
                  Record details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Source: {selectedRow.__source || "database"}
                </p>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(selectedRow)
                  .filter(([key]) => !key.startsWith("__"))
                  .map(([key, value]) => (
                    <div key={key} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        {key}
                      </p>
                      <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                      </pre>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataViewer;
