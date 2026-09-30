import React, { useEffect, useMemo, useState } from "react";
import api from "../../config/ApiConfig";

const money = (value) => `₹${Number(value || 0).toFixed(0)}`;

const RestaurantOverview = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/restaurant/get-restaurant"), api.get("/restaurant/orders"), api.get("/menu/get-items")])
      .then(([restaurantResponse, orderResponse, menuResponse]) => {
        setRestaurant(restaurantResponse.data?.data || null);
        setOrders(orderResponse.data?.data || []);
        setMenuItems(menuResponse.data?.data?.items || []);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Could not load restaurant overview."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    revenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    activeOrders: orders.filter((order) => !["delivered"].includes(order.status)).length,
    completedOrders: orders.filter((order) => order.status === "delivered").length,
    reviews: menuItems.reduce((sum, item) => sum + (item.ratings?.length || 0), 0),
  }), [orders, menuItems]);

  const statusBreakdown = useMemo(() => {
    const stages = ["placed", "cooked", "rider_picked", "delivered"];
    const counts = stages.map((stage) => orders.filter((order) => String(order.status || "").toLowerCase() === stage).length);
    const maxCount = Math.max(1, ...counts);
    return stages.map((stage, index) => ({ stage, count: counts[index], height: Math.max(8, (counts[index] / maxCount) * 100) }));
  }, [orders]);

  if (loading) return <div className="grid min-h-80 place-items-center rounded-3xl bg-white text-slate-500">Loading restaurant overview...</div>;
  if (error) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-orange-700 to-red-500 p-6 text-white shadow-lg">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-100">Restaurant overview</p>
        <h1 className="mt-2 text-3xl font-black">{restaurant?.restaurantName || "Your restaurant"}</h1>
        <p className="mt-2 text-sm text-white/80">Track orders, revenue, menu performance and customer feedback in one place.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total revenue", money(stats.revenue), "bg-orange-50 text-orange-700"],
          ["Active orders", stats.activeOrders, "bg-sky-50 text-sky-700"],
          ["Completed orders", stats.completedOrders, "bg-emerald-50 text-emerald-700"],
          ["Customer reviews", stats.reviews, "bg-violet-50 text-violet-700"],
        ].map(([label, value, tone]) => <div key={label} className={`rounded-3xl p-5 ${tone}`}><p className="text-xs font-black uppercase tracking-wider">{label}</p><p className="mt-3 text-3xl font-black">{value}</p></div>)}
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="order-status-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="order-status-heading" className="text-xl font-black text-slate-900">Order status snapshot</h2>
            <p className="mt-1 text-sm text-slate-500">Current orders grouped by delivery stage</p>
          </div>
          <span className="text-sm font-semibold text-slate-500">{orders.length} total</span>
        </div>
        {orders.length ? (
          <div className="mt-6 grid h-48 grid-cols-4 items-end gap-3" role="img" aria-label={statusBreakdown.map(({ stage, count }) => `${stage}: ${count}`).join(", ")}>
            {statusBreakdown.map(({ stage, count, height }) => (
              <div key={stage} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                <span className="text-sm font-black text-slate-700">{count}</span>
                <div className="flex h-32 w-full items-end overflow-hidden rounded-t-xl bg-orange-50">
                  <div className="w-full rounded-t-xl bg-gradient-to-t from-orange-600 to-amber-400 transition-[height] duration-500" style={{ height: `${height}%` }} />
                </div>
                <span className="max-w-full truncate text-center text-[10px] font-bold capitalize text-slate-500 sm:text-xs">{stage}</span>
              </div>
            ))}
          </div>
        ) : <p className="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">Order activity will appear here after your first order.</p>}
      </section>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="text-xl font-black text-slate-900">Recent orders</h2><span className="text-sm font-semibold text-slate-500">{orders.length} total</span></div>
        {orders.length ? <div className="mt-4 space-y-3">{orders.slice(0, 5).map((order) => <div key={order._id} className="flex flex-col justify-between gap-2 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center"><div><p className="font-black text-slate-900">{order.trackingCode || order._id}</p><p className="text-sm text-slate-500">{order.items?.map((item) => `${item.itemName} ×${item.quantity}`).join(", ")}</p></div><div className="text-left sm:text-right"><p className="font-black text-orange-700">{money(order.total)}</p><span className="text-xs font-bold uppercase text-slate-500">{order.status}</span></div></div>)}</div> : <p className="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">No orders have been placed yet.</p>}
      </div>
    </div>
  );
};

export default RestaurantOverview;
