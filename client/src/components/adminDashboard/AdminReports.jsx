import React from "react";

const AdminReports = () => {
  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">Reports & Analytics</h2>
      <div className="space-y-4">
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Sales Report</h3>
          <p className="text-(--color-neutral) text-sm">Monthly sales trending</p>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <h3 className="font-semibold mb-3">User Analytics</h3>
          <p className="text-(--color-neutral) text-sm">User growth and retention metrics</p>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Performance Metrics</h3>
          <p className="text-(--color-neutral) text-sm">System performance and uptime</p>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
