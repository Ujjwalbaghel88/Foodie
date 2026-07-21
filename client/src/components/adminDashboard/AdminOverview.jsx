import React from "react";

const AdminOverview = () => {
  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">Total Users</p>
          <p className="text-3xl font-bold">542</p>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">Total Orders</p>
          <p className="text-3xl font-bold">1,284</p>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">Total Revenue</p>
          <p className="text-3xl font-bold">$45,320</p>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">Active Restaurants</p>
          <p className="text-3xl font-bold">87</p>
        </div>
      </div>
      <div className="bg-(--color-base-200) p-4 rounded-lg">
        <h3 className="font-semibold mb-3">System Status</h3>
        <p className="text-(--color-neutral) text-sm">✅ All systems operational</p>
      </div>
    </div>
  );
};

export default AdminOverview;
