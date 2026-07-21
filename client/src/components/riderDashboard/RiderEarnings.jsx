import React from "react";

const RiderEarnings = () => {
  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">Earnings</h2>
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">This Week</p>
          <p className="text-3xl font-bold">$425</p>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <p className="text-(--color-neutral) text-sm">This Month</p>
          <p className="text-3xl font-bold">$1,850</p>
        </div>
      </div>
      <div className="bg-(--color-base-200) p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Earnings History</h3>
        <p className="text-(--color-neutral) text-sm">No history available</p>
      </div>
    </div>
  );
};

export default RiderEarnings;
