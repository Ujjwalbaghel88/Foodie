import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { IoArrowBack, IoCheckmarkCircle, IoTimeOutline } from "react-icons/io5";
import { MdDeliveryDining, MdRestaurant, MdOutlineShoppingBag } from "react-icons/md";
import { FaMapMarkerAlt, FaClock, FaRoute } from "react-icons/fa";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../config/ApiConfig";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_CENTER = [23.2599, 77.4126];
const ACTIVE_ORDER_STORAGE_KEY = "cravings_live_order";

const statusMeta = {
  placed: {
    title: "Order placed",
    subtitle: "Restaurant has received your order.",
    icon: MdOutlineShoppingBag,
  },
  cooked: {
    title: "Order cooked",
    subtitle: "Kitchen is preparing your meal.",
    icon: MdRestaurant,
  },
  rider_picked: {
    title: "Delivery rider picked",
    subtitle: "Your order is on the way.",
    icon: MdDeliveryDining,
  },
  delivered: {
    title: "Delivered",
    subtitle: "Enjoy your food.",
    icon: IoCheckmarkCircle,
  },
};

const getDefaultAddress = (addressBook = []) => addressBook[0] || null;

const normalizeCheckoutData = (data) => {
  if (!data) return null;

  return {
    restaurant: data.restaurant || null,
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: Number(data.subtotal || 0),
  };
};

const interpolatePoint = (from, to, progress) => {
  const ratio = Math.min(Math.max(progress, 0), 100) / 100;
  return [
    from[0] + (to[0] - from[0]) * ratio,
    from[1] + (to[1] - from[1]) * ratio,
  ];
};

const MapAutoFit = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points?.length) return;
    const validPoints = points.filter(
      (point) => Array.isArray(point) && point.length === 2,
    );

    if (validPoints.length === 0) return;
    if (validPoints.length === 1) {
      map.setView(validPoints[0], 15, { animate: true });
      return;
    }

    map.fitBounds(validPoints, {
      padding: [40, 40],
      animate: true,
      maxZoom: 15,
    });
  }, [map, points]);

  return null;
};

const MapPanel = ({ restaurantPoint, riderPoint, customerPoint, liveLabel, statusProgress }) => {
  const center = useMemo(() => {
    const lat = (restaurantPoint[0] + customerPoint[0]) / 2;
    const lng = (restaurantPoint[1] + customerPoint[1]) / 2;
    return [lat, lng];
  }, [customerPoint, restaurantPoint]);

  const estimateDistanceKm = useMemo(() => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(customerPoint[0] - restaurantPoint[0]);
    const dLng = toRad(customerPoint[1] - restaurantPoint[1]);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(restaurantPoint[0])) *
        Math.cos(toRad(customerPoint[0])) *
        Math.sin(dLng / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  }, [customerPoint, restaurantPoint]);

  const etaMinutes = useMemo(() => {
    const remaining = Math.max(0, 100 - statusProgress);
    return Math.max(8, Math.round(remaining / 6));
  }, [statusProgress]);

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
              Live route
            </p>
            <h3 className="mt-1 text-lg font-black">{liveLabel}</h3>
          </div>
          <div className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur">
            {statusProgress}% complete
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-3">
        <div className="rounded-[1.25rem] bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            <MdRestaurant />
            Restaurant
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            Pickup point
          </p>
        </div>
        <div className="rounded-[1.25rem] bg-orange-50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            <FaRoute />
            Distance
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            Approx. {estimateDistanceKm} km
          </p>
        </div>
        <div className="rounded-[1.25rem] bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            <FaClock />
            ETA
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            About {etaMinutes} min
          </p>
        </div>
      </div>

      <div className="h-[420px] w-full">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
          <MapAutoFit points={[restaurantPoint, riderPoint, customerPoint]} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline
            positions={[restaurantPoint, riderPoint, customerPoint]}
            pathOptions={{
              color: "#ea580c",
              weight: 5,
              dashArray: "10 10",
              lineCap: "round",
            }}
          />
          <CircleMarker
            center={restaurantPoint}
            radius={11}
            pathOptions={{ color: "#1d4ed8", fillColor: "#1d4ed8", fillOpacity: 1 }}
          >
            <Tooltip direction="top" permanent>
              Restaurant
            </Tooltip>
          </CircleMarker>
          <CircleMarker
            center={riderPoint}
            radius={10}
            pathOptions={{ color: "#ea580c", fillColor: "#ea580c", fillOpacity: 1 }}
          >
            <Tooltip direction="top" permanent>
              Rider
            </Tooltip>
          </CircleMarker>
          <CircleMarker
            center={customerPoint}
            radius={11}
            pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 1 }}
          >
            <Tooltip direction="top" permanent>
              You
            </Tooltip>
          </CircleMarker>
        </MapContainer>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, isLogin } = useAuth();

  const [checkoutData, setCheckoutData] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLogin || user?.userType !== "customer") {
      navigate("/login");
    }
  }, [isLogin, navigate, user]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        if (orderId) {
          const response = await api.get(`/customer/orders/${orderId}`);
          setOrder(response.data.data);
          return;
        }

        const stored = localStorage.getItem("cravings_checkout_data");
        if (!stored) {
          setError("No checkout data found. Please add items from a restaurant menu.");
          return;
        }

        setCheckoutData(normalizeCheckoutData(JSON.parse(stored)));

        const customerResponse = await api.get("/customer/get-customer");
        setCustomer(customerResponse.data.data);
        setSelectedAddressIndex(0);
      } catch (err) {
        console.error("Checkout load error:", err);
        setError(
          err.response?.data?.message ||
            "We could not load checkout details right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return undefined;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/customer/orders/${orderId}`);
        setOrder(response.data.data);
      } catch (err) {
        console.error("Order refresh failed:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (!activeOrder?._id) return undefined;

    if (activeOrder.liveStatus === "delivered") {
      localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
      return undefined;
    }

    localStorage.setItem(
      ACTIVE_ORDER_STORAGE_KEY,
      JSON.stringify({
        orderId: activeOrder._id,
        restaurantName: activeOrder.restaurantName,
        restaurantImage: activeOrder.restaurantImage,
        trackingCode: activeOrder.trackingCode,
        liveStatus: activeOrder.liveStatus,
        liveStatusLabel: activeOrder.liveStatusLabel,
        statusProgress: activeOrder.statusProgress,
        total: activeOrder.total,
        deliveryAddress: activeOrder.deliveryAddress,
      }),
    );

    return undefined;
  }, [activeOrder]);

  const activeCheckoutAddress = useMemo(() => {
    if (!customer?.addressBook?.length) return null;
    return customer.addressBook[selectedAddressIndex] || getDefaultAddress(customer.addressBook);
  }, [customer, selectedAddressIndex]);

  const activeOrder = order || null;

  const mapPoints = useMemo(() => {
    if (activeOrder) {
      const restaurantPoint = [
        Number(activeOrder.restaurantLocation?.lat || DEFAULT_CENTER[0]),
        Number(activeOrder.restaurantLocation?.lng || DEFAULT_CENTER[1]),
      ];
      const customerPoint = [
        Number(activeOrder.deliveryAddress?.geolocation?.lat || restaurantPoint[0] + 0.01),
        Number(activeOrder.deliveryAddress?.geolocation?.lng || restaurantPoint[1] + 0.01),
      ];
      const riderPoint = interpolatePoint(
        restaurantPoint,
        customerPoint,
        activeOrder.statusProgress || 0,
      );

      return { restaurantPoint, customerPoint, riderPoint };
    }

    const restaurantPoint = [
      Number(checkoutData?.restaurant?.geolocation?.lat || DEFAULT_CENTER[0]),
      Number(checkoutData?.restaurant?.geolocation?.lng || DEFAULT_CENTER[1]),
    ];
    const customerPoint = [
      Number(activeCheckoutAddress?.geolocation?.lat || restaurantPoint[0] + 0.01),
      Number(activeCheckoutAddress?.geolocation?.lng || restaurantPoint[1] + 0.01),
    ];
    const riderPoint = interpolatePoint(restaurantPoint, customerPoint, 35);

    return { restaurantPoint, customerPoint, riderPoint };
  }, [activeCheckoutAddress, activeOrder, checkoutData]);

  const handlePlaceOrder = async () => {
    if (!checkoutData?.restaurant || !checkoutData?.items?.length) {
      toast.error("Cart data is missing");
      return;
    }

    if (!activeCheckoutAddress) {
      toast.error("Please add a delivery address first");
      return;
    }

    try {
      setPlacingOrder(true);
      const payload = {
        restaurantId: checkoutData.restaurant.id,
        restaurantName: checkoutData.restaurant.name,
        restaurantImage: checkoutData.restaurant.image,
        restaurantLocation: checkoutData.restaurant.geolocation,
        deliveryAddress: activeCheckoutAddress,
        items: checkoutData.items,
        deliveryFee: 30,
      };

      const response = await api.post("/customer/orders", payload);
      localStorage.removeItem("cravings_checkout_data");
      localStorage.setItem(
        ACTIVE_ORDER_STORAGE_KEY,
        JSON.stringify({
          orderId: response.data.data._id,
          restaurantName: response.data.data.restaurantName,
          restaurantImage: response.data.data.restaurantImage,
          trackingCode: response.data.data.trackingCode,
          liveStatus: response.data.data.liveStatus,
          liveStatusLabel: response.data.data.liveStatusLabel,
          statusProgress: response.data.data.statusProgress,
          total: response.data.data.total,
          deliveryAddress: response.data.data.deliveryAddress,
        }),
      );
      toast.success(response.data.message);
      navigate(`/track-order/${response.data.data._id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Order placement failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  const currentStatus = activeOrder?.liveStatus || "placed";
  const timeline = activeOrder?.statusTimeline || Object.keys(statusMeta).map((status, index) => ({
    status,
    title: statusMeta[status].title,
    subtitle: statusMeta[status].subtitle,
    completed: index === 0,
    active: index === 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f1] grid place-items-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fff7f1] grid place-items-center px-4">
        <div className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-xl">
          <p className="text-lg font-bold text-slate-900">{error}</p>
          <button
            onClick={() => navigate("/order-now")}
            className="mt-6 rounded-full bg-(--color-primary) px-6 py-3 font-bold text-white"
          >
            Back to restaurants
          </button>
        </div>
      </div>
    );
  }

  if (activeOrder) {
    const progress = activeOrder.statusProgress || 0;

    return (
      <div className="min-h-screen bg-[#fff7f1] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <button
            onClick={() => navigate("/customer-dashboard", { state: { activeTab: "orders" } })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <IoArrowBack />
            My Orders
          </button>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                      Order successful
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-slate-900">
                      {activeOrder.restaurantName}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                      Tracking code {activeOrder.trackingCode}
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                    {activeOrder.liveStatusLabel}
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-600">Live progress</span>
                    <span className="font-black text-slate-900">{progress}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">Order timeline</h2>
                <div className="mt-6 space-y-4">
                  {timeline.map((step) => {
                    const StepIcon = statusMeta[step.status].icon;
                    return (
                      <div
                        key={step.status}
                        className={`flex items-start gap-4 rounded-[1.5rem] border p-4 ${
                          step.completed
                            ? "border-emerald-200 bg-emerald-50"
                            : step.active
                              ? "border-orange-200 bg-orange-50"
                              : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            step.completed
                              ? "bg-emerald-500 text-white"
                              : step.active
                                ? "bg-orange-500 text-white"
                                : "bg-slate-300 text-slate-600"
                          }`}
                        >
                          <StepIcon />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{step.title}</p>
                          <p className="text-sm text-slate-500">{step.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <MapPanel
                restaurantPoint={mapPoints.restaurantPoint}
                riderPoint={mapPoints.riderPoint}
                customerPoint={mapPoints.customerPoint}
                liveLabel={activeOrder.liveStatusLabel || "Live route"}
                statusProgress={progress}
              />

              <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">Order summary</h2>
                <div className="mt-4 space-y-3">
                  {activeOrder.items.map((item) => (
                    <div key={`${item.itemName}-${item.price}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-900">{item.itemName}</p>
                        <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                      </div>
                      <p className="font-black text-slate-900">Rs {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>Rs {Number(activeOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-slate-500">
                    <span>Delivery fee</span>
                    <span>Rs {Number(activeOrder.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-slate-500">
                    <span>Tax</span>
                    <span>Rs {Number(activeOrder.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-lg font-black text-slate-900">
                    <span>Total</span>
                    <span>Rs {Number(activeOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const restaurant = checkoutData?.restaurant;
  const items = checkoutData?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const deliveryFee = 30;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + deliveryFee + tax).toFixed(2));

  return (
    <div className="min-h-screen bg-[#fff7f1] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <IoArrowBack />
          Back
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                Checkout
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">
                {restaurant?.name || "Your order"}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Review your cart, select an address, and place the order.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Delivery address</h2>
              {customer?.addressBook?.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {customer.addressBook.map((address, index) => (
                    <button
                      key={address._id}
                      onClick={() => setSelectedAddressIndex(index)}
                      className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                        selectedAddressIndex === index
                          ? "border-orange-300 bg-orange-50"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-black text-slate-900">
                            {address.ReceiverName}
                          </p>
                          <p className="text-sm text-slate-600">{address.address}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {address.city}, {address.state} - {address.zipCode}
                          </p>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                          {address.ReceiverPhone}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.5rem] border border-dashed border-amber-300 bg-amber-50 p-5">
                  <p className="font-semibold text-amber-900">
                    No delivery address found.
                  </p>
                  <button
                    onClick={() => navigate("/customer-dashboard", { state: { activeTab: "settings" } })}
                    className="mt-4 rounded-full bg-amber-600 px-5 py-2 text-sm font-bold text-white"
                  >
                    Add address
                  </button>
                </div>
              )}
            </div>

            <MapPanel
              restaurantPoint={mapPoints.restaurantPoint}
              riderPoint={mapPoints.riderPoint}
              customerPoint={mapPoints.customerPoint}
              liveLabel="Checkout delivery route"
              statusProgress={35}
            />
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Cart summary</h2>
              <div className="mt-5 space-y-3">
                {items.map((item) => (
                  <div key={`${item.itemName}-${item.price}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-900">{item.itemName}</p>
                      <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                    </div>
                    <p className="font-black text-slate-900">Rs {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4 text-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>Rs {subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-slate-500">
                  <span>Delivery fee</span>
                  <span>Rs {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-slate-500">
                  <span>Tax</span>
                  <span>Rs {tax.toFixed(2)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-lg font-black text-slate-900">
                  <span>Total</span>
                  <span>Rs {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !activeCheckoutAddress}
                className="mt-6 w-full rounded-2xl bg-(--color-primary) px-5 py-3 font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placingOrder ? "Placing order..." : "Place order"}
              </button>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">What happens next</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <IoTimeOutline className="text-orange-500" />
                  Order placed instantly
                </div>
                <div className="flex items-center gap-3">
                  <MdRestaurant className="text-orange-500" />
                  Kitchen starts cooking
                </div>
                <div className="flex items-center gap-3">
                  <MdDeliveryDining className="text-orange-500" />
                  Rider picks up your order
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-emerald-500" />
                  Live map tracking till delivered
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
