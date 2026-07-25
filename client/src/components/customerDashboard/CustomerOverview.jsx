import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../config/ApiConfig";
import { getRestaurantCoverImage } from "../../utils/restaurantCoverImages";
import {
  buildCheckoutDataFromOrder,
  storeCheckoutData,
} from "../../utils/checkoutStorage";
import { buildCustomerInsights } from "../../utils/customerInsights";

const CustomerOverview = () => {
  const navigate = useNavigate();
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
    return buildCustomerInsights(orders);
  }, [orders]);

  const handleQuickReorder = () => {
    if (!summary.recentOrder) {
      toast.error("No recent order found to reorder.");
      return;
    }

    const checkoutData = buildCheckoutDataFromOrder(summary.recentOrder);

    if (!checkoutData) {
      toast.error("Could not rebuild the recent order.");
      return;
    }

    storeCheckoutData(checkoutData);
    toast.success("Recent order loaded into checkout.");
    navigate("/checkout");
  };

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
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Favorite restaurant
              </p>
              <p className="mt-2 text-lg font-black text-slate-900">
                {summary.favoriteRestaurant?.name || "N/A"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Favorite cuisine
              </p>
              <p className="mt-2 text-lg font-black capitalize text-slate-900">
                {summary.favoriteCuisine?.name || "N/A"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Favorite item
              </p>
              <p className="mt-2 text-lg font-black text-slate-900 line-clamp-1">
                {summary.favoriteItem?.name || "N/A"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Average spend
              </p>
              <p className="mt-2 text-lg font-black text-slate-900">
                Rs {summary.averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>

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
                  src={getRestaurantCoverImage(
                    summary.recentOrder.restaurantName,
                    summary.recentOrder.restaurantImage,
                  )}
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
                  <button
                    onClick={handleQuickReorder}
                    className="mt-4 rounded-full bg-(--color-primary) px-4 py-2 text-sm font-bold text-white"
                  >
                    Quick reorder
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No recent orders.</p>
            )}
          </div>

          <div className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900">Most Ordered</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your most repeated items across past orders.
                </p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                Top picks
              </span>
            </div>

            {summary.mostOrderedItems?.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {summary.mostOrderedItems.map((item, index) => (
                  <div
                    key={`${item.restaurantName}-${item.itemName}-${index}`}
                    className="flex items-center gap-4 rounded-[1.4rem] border border-slate-100 bg-slate-50 p-4"
                  >
                    <img
                      src={getRestaurantCoverImage(
                        item.restaurantName,
                        item.restaurantImage,
                      )}
                      alt={item.restaurantName}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">
                        {item.itemName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                        {item.restaurantName}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {item.quantity} ordered
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          Rs {item.totalSpent.toFixed(2)} spent
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const checkoutData = buildCheckoutDataFromOrder(item.sourceOrder);

                        if (!checkoutData) {
                          toast.error("Could not load this item into checkout.");
                          return;
                        }

                        storeCheckoutData(checkoutData);
                        toast.success(`${item.itemName} loaded into checkout.`);
                        navigate("/checkout");
                      }}
                      className="shrink-0 rounded-full bg-(--color-primary) px-4 py-2 text-sm font-bold text-white"
                    >
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No repeated items yet. Place a few more orders to build your favorites.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerOverview;
