import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../../config/ApiConfig";

const AdminSetting = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleImport = async (replace = false) => {
    const confirmMessage = replace
      ? "This will clear the existing demo data and import the JSON files again. Continue?"
      : "Import the JSON data into the database?";

    if (!window.confirm(confirmMessage)) return;

    try {
      if (replace) {
        setIsResetting(true);
      } else {
        setIsImporting(true);
      }

      const response = await api.post("/admin/seed-legacy-json", { replace });
      setLastResult(response.data?.data || null);
      toast.success(response.data?.message || "Import completed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not import data");
    } finally {
      setIsImporting(false);
      setIsResetting(false);
    }
  };

  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-4">
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Legacy JSON Data</h3>
          <p className="text-sm text-(--color-neutral) mb-4">
            Use the exported `cravingsDB.*.json` files to seed or refresh the local database.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleImport(false)}
              disabled={isImporting || isResetting}
              className="bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded disabled:opacity-60"
            >
              {isImporting ? "Importing..." : "Import JSON"}
            </button>
            <button
              onClick={() => handleImport(true)}
              disabled={isImporting || isResetting}
              className="bg-rose-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {isResetting ? "Resetting..." : "Reset & Import"}
            </button>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Last Import Result</h3>
          {lastResult ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-white/70 p-3">Users: {lastResult.users}</div>
              <div className="rounded-md bg-white/70 p-3">Restaurants: {lastResult.restaurants}</div>
              <div className="rounded-md bg-white/70 p-3">Menus: {lastResult.menuitems}</div>
              <div className="rounded-md bg-white/70 p-3">Customers: {lastResult.customers}</div>
              <div className="rounded-md bg-white/70 p-3">Riders: {lastResult.riders}</div>
            </div>
          ) : (
            <p className="text-sm text-(--color-neutral)">
              No import has been run in this session yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetting;
