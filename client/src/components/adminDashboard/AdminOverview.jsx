import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";

const AdminOverview = () => {
  const [managers, setManagers] = useState([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold">Restaurant Manager Progress</h3>
            <p className="text-sm text-(--color-neutral)">
              Restaurant profile is 50%; adding one or more menu items is the remaining 50%.
            </p>
          </div>
          <span className="text-sm font-semibold">{managers.length} managers</span>
        </div>

        {isLoadingManagers ? (
          <p className="text-(--color-neutral)">Loading managers...</p>
        ) : error ? (
          <p className="text-(--color-error)">{error}</p>
        ) : managers.length === 0 ? (
          <p className="text-(--color-neutral)">No restaurant managers found.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {managers.map((manager) => (
              <article key={manager.id} className="bg-(--color-base-200) rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={manager.photo?.url || "/userImage.jpg"}
                    alt={manager.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold truncate">{manager.fullName}</h4>
                    <p className="text-sm text-(--color-neutral) truncate">{manager.email}</p>
                    <p className="text-sm text-(--color-neutral)">{manager.restaurantName}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{manager.menuItemCount} menu items</span>
                  <span className="font-bold">{manager.progress}% complete</span>
                </div>
                <div className="h-2 rounded-full bg-(--color-base-300) overflow-hidden">
                  <div
                    className="h-full bg-(--color-primary) transition-all"
                    style={{ width: `${manager.progress}%` }}
                  />
                </div>
                <div className="mt-3 flex gap-2 text-xs font-semibold">
                  <span className={manager.profileComplete ? "text-(--color-success)" : "text-(--color-warning)"}>
                    {manager.profileComplete ? "Profile complete" : "Profile pending"}
                  </span>
                  <span className={manager.menuItemCount ? "text-(--color-success)" : "text-(--color-warning)"}>
                    {manager.menuItemCount ? "Menu added" : "Menu pending"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminOverview;
