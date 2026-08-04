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
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../config/ApiConfig";
import useAuth from "../../context/useAuth";
import { getRestaurantCoverImage } from "../../utils/restaurantCoverImages";

const DEFAULT_CENTER = [23.2599, 77.4126];
const ACTIVE_ORDER_STORAGE_KEY = "cravings_live_order";
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement("script");
  script.src = RAZORPAY_SCRIPT_URL;
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error("Razorpay checkout could not load"));
  document.body.appendChild(script);
});

const statusMeta = {
  placed: {
    title: "Placed",
    subtitle: "Restaurant has received your order.",
    icon: MdOutlineShoppingBag,
  },
  cooked: {
    title: "Cooking",
    subtitle: "Kitchen is preparing your meal.",
    icon: MdRestaurant,
  },
  rider_picked: {
    title: "Picked",
    subtitle: "Rider picked your order and is arriving.",
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

  const riderIcon = useMemo(
    () =>
      divIcon({
        className: "rider-map-icon",
        html: '<span class="rider-map-icon__pulse"></span><span class="rider-map-icon__body">⌁</span>',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      }),
    [],
  );

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-orange-100">
      <style>{`
        .rider-map-icon { background: transparent; border: 0; }
        .rider-map-icon__body {
          position: absolute; inset: 8px; display: grid; place-items: center;
          border: 3px solid white; border-radius: 999px; background: #f97316;
          color: white; font-size: 24px; font-weight: 900; line-height: 1;
          box-shadow: 0 5px 14px rgba(234, 88, 12, .4);
          transform: rotate(-45deg);
        }
        .rider-map-icon__pulse {
          position: absolute; inset: 2px; border-radius: 999px;
          border: 2px solid #fb923c; animation: rider-pulse 1.8s ease-out infinite;
        }
        @keyframes rider-pulse { 0% { transform: scale(.7); opacity: .8; } 100% { transform: scale(1.35); opacity: 0; } }
      `}</style>
      <div className="border-b border-orange-400/30 bg-gradient-to-br from-[#f97316] via-[#ea580c] to-[#c2410c] px-5 py-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/75">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Live tracking
            </p>
            <h3 className="mt-1 text-lg font-black">{liveLabel}</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black leading-none">{etaMinutes}<span className="ml-1 text-sm font-bold">min</span></p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/70">estimated arrival</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-100 bg-white p-4 sm:grid-cols-3">
        <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            <MdRestaurant />
            Restaurant
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            Pickup point
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-orange-100 bg-orange-50 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            <FaRoute />
            Distance
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            Approx. {estimateDistanceKm} km
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            <FaClock />
            ETA
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            About {etaMinutes} min
          </p>
        </div>
      </div>

      <div className="relative h-[420px] w-full">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
          <MapAutoFit points={[restaurantPoint, riderPoint, customerPoint]} />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <Polyline
            positions={[restaurantPoint, riderPoint]}
            pathOptions={{
              color: "#ea580c",
              weight: 7,
              lineCap: "round",
            }}
          />
          <Polyline
            positions={[riderPoint, customerPoint]}
            pathOptions={{ color: "#94a3b8", weight: 5, dashArray: "8 12", lineCap: "round" }}
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
          <Marker position={riderPoint} icon={riderIcon}>
            <Tooltip direction="top" permanent>
              Your rider
            </Tooltip>
          </Marker>
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
        <div className="pointer-events-none absolute left-4 top-4 z-[400] rounded-2xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Rider is on the way
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
            <span className="h-0.5 w-5 bg-slate-400" /> Live route updates every few seconds
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[400] rounded-2xl bg-slate-950/85 px-4 py-3 text-white shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>Order progress</span><span>{statusProgress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300 transition-all duration-700" style={{ width: `${statusProgress}%` }} />
          </div>
        </div>
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
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const activeOrder = order || null;

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
          restaurantImage: getRestaurantCoverImage(
            activeOrder.restaurantName,
            activeOrder.restaurantImage,
          ),
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

      const finishOrder = (response) => {
        localStorage.removeItem("cravings_checkout_data");
        localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify({
          orderId: response.data.data._id,
          restaurantName: response.data.data.restaurantName,
          restaurantImage: getRestaurantCoverImage(response.data.data.restaurantName, response.data.data.restaurantImage),
          trackingCode: response.data.data.trackingCode,
          liveStatus: response.data.data.liveStatus,
          liveStatusLabel: response.data.data.liveStatusLabel,
          statusProgress: response.data.data.statusProgress,
          total: response.data.data.total,
          deliveryAddress: response.data.data.deliveryAddress,
        }));
        toast.success(response.data.message);
        navigate(`/track-order/${response.data.data._id}`, { replace: true });
      };

      if (paymentMethod === "cod") {
        const response = await api.post("/customer/orders", payload);
        finishOrder(response);
        return;
      }

      const paymentOrder = await api.post("/customer/payments/razorpay/order", payload);
      await loadRazorpay();
      const razorpay = new window.Razorpay({
        key: paymentOrder.data.keyId,
        amount: paymentOrder.data.amount,
        currency: paymentOrder.data.currency,
        name: "Cravings",
        description: `Food order from ${payload.restaurantName}`,
        order_id: paymentOrder.data.razorpayOrderId,
        prefill: {
          name: activeCheckoutAddress.ReceiverName,
          contact: activeCheckoutAddress.ReceiverPhone,
          email: user?.email || "",
        },
        theme: { color: "#f97316" },
        handler: async (paymentResponse) => {
          try {
            const response = await api.post("/customer/payments/razorpay/verify", {
              ...paymentResponse,
              orderPayload: payload,
            });
            finishOrder(response);
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          } finally {
            setPlacingOrder(false);
          }
        },
        modal: { ondismiss: () => setPlacingOrder(false) },
      });
      razorpay.on("payment.failed", (failure) => {
        toast.error(failure.error?.description || "Payment failed");
        setPlacingOrder(false);
      });
      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Order placement failed");
    } finally {
      if (paymentMethod === "cod") setPlacingOrder(false);
    }
  };

  const timeline = activeOrder?.statusTimeline || Object.keys(statusMeta).map((status, index) => ({
    status,
    title: statusMeta[status].title,
    subtitle: statusMeta[status].subtitle,
    completed: index === 0,
    active: index === 0,
  }));
  const timelineStatusLabel = (status) => {
    if (status === "rider_picked") return "Picked / Arriving";
    return statusMeta[status]?.title || status;
  };

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
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black text-slate-900">
                                {timelineStatusLabel(step.status) || step.title}
                              </p>
                              {step.status === "rider_picked" ? (
                                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                                  Arriving
                                </span>
                              ) : null}
                            </div>
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

              <div className="mt-5">
                <p className="mb-3 text-sm font-black text-slate-900">Payment method</p>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`mb-3 flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${paymentMethod === "cod" ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-slate-50"}`}
                >
                  <span>
                    <span className="block font-black text-slate-900">Cash on delivery</span>
                    <span className="mt-1 block text-xs text-slate-500">Pay when your order arrives</span>
                  </span>
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">COD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${paymentMethod === "razorpay" ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-slate-50"}`}
                >
                  <span>
                    <span className="block font-black text-slate-900">Pay online with Razorpay</span>
                    <span className="mt-1 block text-xs text-slate-500">UPI, cards, net banking & wallets</span>
                  </span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">Razorpay</span>
                </button>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !activeCheckoutAddress}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-(--color-primary) px-5 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placingOrder ? <><span className="cravings-spinner" /> Opening payment...</> : <>Pay ₹{total.toFixed(2)} <MdOutlineShoppingBag /></>}
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
