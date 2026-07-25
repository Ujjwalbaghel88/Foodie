import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoTimeOutline } from "react-icons/io5";
import { FaMotorcycle } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../config/ApiConfig";
import { getRestaurantCoverImage } from "../../utils/restaurantCoverImages";
import {
  buildCheckoutDataFromOrder,
  storeCheckoutData,
} from "../../utils/checkoutStorage";

const statusTone = {
  placed: "bg-blue-100 text-blue-700",
  cooked: "bg-orange-100 text-orange-700",
  rider_picked: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleReorder = (order) => {
    const checkoutData = buildCheckoutDataFromOrder(order);

    if (!checkoutData) {
      toast.error("Could not rebuild this order.");
      return;
    }

    storeCheckoutData(checkoutData);
    toast.success("Reorder ready in checkout.");
    navigate("/checkout");
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/customer/orders");
        setOrders(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError(err.response?.data?.message || "Could not load your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <h2 className="mb-6 text-2xl font-black text-slate-900">My Orders</h2>
        <div className="grid place-items-center rounded-[2rem] bg-white py-16 shadow-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <h2 className="mb-6 text-2xl font-black text-slate-900">My Orders</h2>
        <div className="rounded-[2rem] bg-amber-50 p-6 text-center">
          <p className="font-semibold text-amber-900">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-(--color-primary) px-5 py-2 font-bold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <h2 className="mb-6 text-2xl font-black text-slate-900">My Orders</h2>
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <FaMotorcycle className="mx-auto text-4xl text-orange-500" />
          <p className="mt-4 text-lg font-bold text-slate-900">
            No orders yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Place your first order and track it live from here.
          </p>
          <button
            onClick={() => navigate("/order-now")}
            className="mt-6 rounded-full bg-(--color-primary) px-6 py-3 font-bold text-white"
          >
            Order now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">My Orders</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track your orders from placed to delivered.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <img
                  src={getRestaurantCoverImage(
                    order.restaurantName,
                    order.restaurantImage,
                  )}
                  alt={order.restaurantName}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                    {order.trackingCode}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-900">
                    {order.restaurantName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.items?.length || 0} item
                    {order.items?.length !== 1 ? "s" : ""} • Rs{" "}
                    {Number(order.total || 0).toFixed(2)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusTone[order.liveStatus] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {order.liveStatusLabel || "Placed"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <IoTimeOutline />
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Progress</p>
                  <p className="text-2xl font-black text-slate-900">
                    {order.statusProgress || 0}%
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => navigate(`/track-order/${order._id}`)}
                    className="rounded-full bg-(--color-primary) px-5 py-2 font-bold text-white"
                  >
                    Track order
                  </button>
                  <button
                    onClick={() => handleReorder(order)}
                    className="rounded-full border border-orange-200 bg-white px-5 py-2 font-bold text-orange-600 transition hover:bg-orange-50"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-4">
              {(order.statusTimeline || []).map((step) => (
                <div
                  key={step.status}
                  className={`rounded-2xl px-3 py-2 text-xs font-semibold ${
                    step.completed
                      ? "bg-emerald-50 text-emerald-700"
                      : step.active
                        ? "bg-orange-50 text-orange-700"
                        : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerOrders;
