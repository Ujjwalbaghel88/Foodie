import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = () => api.get("/restaurant/orders").then((response) => setOrders(response.data?.data || [])).catch((requestError) => setError(requestError.response?.data?.message || "Could not load orders.")).finally(() => setLoading(false));
  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const response = await api.patch(`/restaurant/orders/${orderId}/status`, { status });
      setOrders((current) => current.map((order) => order._id === orderId ? response.data.data : order));
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not update order."); }
  };

  if (loading) return <div className="grid min-h-80 place-items-center rounded-3xl bg-white text-slate-500">Loading orders...</div>;
  return <div className="space-y-5"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Restaurant orders</p><h1 className="mt-2 text-3xl font-black text-slate-900">Manage incoming orders</h1></div>{error && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}{orders.length ? <div className="space-y-4">{orders.map((order) => <div key={order._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center"><div><p className="font-black text-slate-900">{order.trackingCode || order._id}</p><p className="mt-1 text-sm text-slate-500">{order.customerId?.fullName || "Customer"} · {new Date(order.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase text-orange-700">{order.status}</span><select value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"><option value="placed">Placed</option><option value="cooked">Cooked</option><option value="rider_picked">Rider picked</option><option value="delivered">Delivered</option></select></div></div><div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">{order.items?.map((item) => <div key={`${order._id}-${item.itemId}-${item.itemName}`} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span>{item.itemName} × {item.quantity}</span><b>₹{Number(item.price * item.quantity).toFixed(0)}</b></div>)}</div><p className="mt-4 text-right text-lg font-black text-orange-700">Total ₹{Number(order.total || 0).toFixed(0)}</p></div>)}</div> : <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">No orders received yet.</div>}</div>;
};

export default RestaurantOrders;
