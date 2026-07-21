import React from "react";

const RiderOverview = () => {
  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">Today's Deliveries</p>
          <p className="text-3xl font-bold">5</p>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">Today's Earnings</p>
          <p className="text-3xl font-bold">$75</p>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">Total Deliveries</p>
          <p className="text-3xl font-bold">128</p>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">Rating</p>
          <p className="text-3xl font-bold">4.8⭐</p>
        </div>
      </div>
      <div className="bg-(--color-base-200) p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Active Deliveries</h3>
        <p className="text-(--color-neutral) text-sm">No active deliveries</p>
      </div>
    </div>
  );
};

export default RiderOverview;
