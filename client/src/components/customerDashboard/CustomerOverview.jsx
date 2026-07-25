import React, { useEffect, useMemo, useState } from "react";
import api from "../../config/ApiConfig";

const CustomerOverview = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/customer/orders");
        setOrders(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        console.error("Failed to load overview orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );
    const recentOrder = orders[0] || null;

    return { totalOrders, totalSpent, recentOrder };
  }, [orders]);

  return (
    <div className="h-full overflow-y-auto">
      <h2 className="mb-6 text-2xl font-black text-slate-900">Overview</h2>

      {loading ? (
        <div className="grid place-items-center rounded-[2rem] bg-white py-16 shadow-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading overview...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {summary.totalOrders}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                Rs {summary.totalSpent.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-900">Recent Order</h3>
            {summary.recentOrder ? (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={summary.recentOrder.restaurantImage}
                  alt={summary.recentOrder.restaurantName}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">
                    {summary.recentOrder.restaurantName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {summary.recentOrder.liveStatusLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-orange-600">
                    Rs {Number(summary.recentOrder.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No recent orders.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerOverview;
