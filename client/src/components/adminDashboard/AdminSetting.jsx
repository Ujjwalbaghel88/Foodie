import React from "react";

const AdminSetting = () => {
  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-4">
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <h3 className="font-semibold mb-3">System Configuration</h3>
          <button className="bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded">
            Manage Settings
          </button>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Commission Rates</h3>
          <button className="bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded">
            Update Rates
          </button>
        </div>
        <div className="bg-(--color-base-200) p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Email Notifications</h3>
          <button className="bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded">
            Configure Alerts
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSetting;
