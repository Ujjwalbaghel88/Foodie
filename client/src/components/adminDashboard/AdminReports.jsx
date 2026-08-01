import React, { useEffect, useMemo, useState } from "react";
import { FaDownload, FaRedo, FaShoppingBag, FaUsers, FaStore, FaMotorcycle } from "react-icons/fa";
import api from "../../config/ApiConfig";

const statusLabels = { placed: "Placed", cooked: "Cooking", rider_picked: "Out for delivery", delivered: "Delivered" };
const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const AdminReports = () => {
  const [months, setMonths] = useState(6);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/admin/reports?months=${months}`);
      setReport(response.data?.data || null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load reports right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [months]);

  const monthly = useMemo(() => {
    const rows = report?.monthly || [];
    const values = rows.map((row) => Number(row.revenue || 0));
    const max = Math.max(...values, 1);
    return rows.map((row) => ({ ...row, height: `${Math.max((Number(row.revenue || 0) / max) * 100, 5)}%`, label: new Date(row._id.year, row._id.month - 1).toLocaleDateString("en-IN", { month: "short" }) }));
  }, [report]);

  const exportReport = () => {
    if (!report) return;
    const rows = [["Month", "Orders", "Revenue"], ...monthly.map((row) => [row.label, row.orders, row.revenue])];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `cravings-report-${months}-months.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="grid min-h-[420px] place-items-center"><span className="cravings-spinner h-10 w-10 border-4 text-orange-600" /></div>;
  if (error) return <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center"><p className="font-bold text-red-700">{error}</p><button onClick={loadReport} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-bold text-white"><FaRedo /> Try again</button></div>;

  const totals = report?.totals || {};
  const platform = report?.platform || {};
  const maxStatus = Math.max(...(report?.statuses || []).map((item) => item.orders), 1);

  return (
    <div className="h-full overflow-y-auto pb-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Business intelligence</p><h2 className="mt-1 text-3xl font-black text-slate-900">Reports & Analytics</h2><p className="mt-2 text-sm text-slate-500">A live view of orders, revenue, and platform health.</p></div>
        <div className="flex flex-wrap gap-2"><select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"><option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select><button onClick={loadReport} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-orange-50" title="Refresh"><FaRedo /></button><button onClick={exportReport} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-orange-600"><FaDownload /> Export CSV</button></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Total revenue", value: money(totals.revenue), icon: FaShoppingBag, iconClass: "text-orange-500" }, { label: "Orders placed", value: totals.orders || 0, icon: FaShoppingBag, iconClass: "text-blue-500" }, { label: "Customers", value: platform.customers || 0, icon: FaUsers, iconClass: "text-violet-500" }, { label: "Active partners", value: `${platform.activeRestaurants || 0} / ${platform.activeRiders || 0}`, icon: FaStore, iconClass: "text-emerald-500" }].map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.label}</p><Icon className={card.iconClass} /></div><p className="mt-3 text-2xl font-black text-slate-900">{card.value}</p></div>; })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-lg font-black text-slate-900">Sales report</h3><p className="text-sm text-slate-500">Monthly revenue trend</p></div><p className="text-sm font-bold text-orange-600">Avg. {money(totals.averageOrder)} / order</p></div><div className="mt-8 flex h-56 items-end gap-3 border-b border-slate-100 px-2">{monthly.length ? monthly.map((row) => <div key={`${row._id.year}-${row._id.month}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="relative flex w-full flex-1 items-end"><div className="w-full rounded-t-xl bg-gradient-to-t from-orange-600 to-amber-300 transition-all duration-700 group-hover:from-red-500" style={{ height: row.height }} title={money(row.revenue)} /></div><span className="text-xs font-bold text-slate-500">{row.label}</span></div>) : <p className="mb-8 w-full text-center text-sm text-slate-400">No orders found for this period.</p>}</div></section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-black text-slate-900">Order performance</h3><p className="text-sm text-slate-500">Current order status mix</p><div className="mt-6 space-y-4">{(report?.statuses || []).length ? report.statuses.map((item) => <div key={item._id}><div className="mb-1 flex justify-between text-sm"><span className="font-semibold text-slate-700">{statusLabels[item._id] || item._id}</span><span className="font-black text-slate-900">{item.orders}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500 transition-all duration-700" style={{ width: `${(item.orders / maxStatus) * 100}%` }} /></div></div>) : <p className="py-8 text-sm text-slate-400">Order status data will appear after your first order.</p>}</div></section>
      </div>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><FaStore className="text-orange-500" /><div><h3 className="text-lg font-black text-slate-900">Top restaurants</h3><p className="text-sm text-slate-500">Highest revenue in the selected period</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{(report?.topRestaurants || []).length ? report.topRestaurants.map((restaurant, index) => <div key={restaurant._id} className="rounded-2xl bg-orange-50 p-4"><div className="flex items-center justify-between"><span className="grid h-7 w-7 place-items-center rounded-full bg-orange-600 text-xs font-black text-white">{index + 1}</span><span className="text-xs font-bold text-slate-500">{restaurant.orders} orders</span></div><p className="mt-3 line-clamp-1 font-black text-slate-900">{restaurant._id}</p><p className="mt-1 text-sm font-bold text-orange-700">{money(restaurant.revenue)}</p></div>) : <p className="text-sm text-slate-400">Restaurant performance will appear after orders are placed.</p>}</div></section>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-orange-50 p-4"><FaStore className="text-orange-600" /><p className="mt-3 text-2xl font-black text-slate-900">{platform.activeRestaurants || 0}</p><p className="text-sm text-slate-500">Active restaurants</p></div><div className="rounded-2xl bg-blue-50 p-4"><FaMotorcycle className="text-blue-600" /><p className="mt-3 text-2xl font-black text-slate-900">{platform.activeRiders || 0}</p><p className="text-sm text-slate-500">Active riders</p></div><div className="rounded-2xl bg-violet-50 p-4"><FaUsers className="text-violet-600" /><p className="mt-3 text-2xl font-black text-slate-900">{platform.customers || 0}</p><p className="text-sm text-slate-500">Registered customers</p></div></div>
    </div>
  );
};

export default AdminReports;
