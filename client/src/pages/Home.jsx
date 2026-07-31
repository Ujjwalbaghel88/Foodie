import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSearch,
  IoStar,
  IoTimeOutline,
  IoChevronForward,
  IoBagHandleOutline,
  IoHeartOutline,
  IoHeart,
} from "react-icons/io5";
import { FaMotorcycle, FaShieldAlt, FaFireAlt } from "react-icons/fa";
import {
  MdRestaurant,
  MdLocalDining,
  MdFastfood,
  MdCake,
  MdLunchDining,
  MdArrowForward,
  MdVerified,
} from "react-icons/md";
import CarouselComponent from "../components/CarouselComponent";
import useAuth from "../context/useAuth";
import api from "../config/ApiConfig";
import { getRestaurantCoverImage } from "../utils/restaurantCoverImages";
import { buildCheckoutDataFromOrder, storeCheckoutData } from "../utils/checkoutStorage";
import { buildCustomerInsights } from "../utils/customerInsights";
import {
  readFavoriteRestaurantIds,
  toggleFavoriteRestaurantId,
} from "../utils/favoritesStorage";

const assetBase = import.meta.env.BASE_URL;

const categories = [
  { id: "all", label: "All", icon: MdRestaurant, keyword: null },
  { id: "veg", label: "Vegetarian", icon: MdLocalDining, keyword: "vegetarian" },
  { id: "nonveg", label: "Non-Veg", icon: MdFastfood, keyword: "non-vegetarian" },
  { id: "dessert", label: "Desserts", icon: MdCake, keyword: "dessert" },
  { id: "others", label: "Others", icon: MdLunchDining, keyword: "other" },
];

const discoveryCards = [
  {
    icon: FaMotorcycle,
    title: "Fast delivery",
    text: "Hot food, tracked in real time, right to your door.",
  },
  {
    icon: FaShieldAlt,
    title: "Trusted partners",
    text: "Verified restaurants and reliable service every time.",
  },
  {
    icon: IoTimeOutline,
    title: "Easy reorder",
    text: "Come back to the meals you love in just a tap.",
  },
];

const foodInspirationCards = [
  {
    title: "Veg Meal",
    subtitle: "Comfort plate",
    image: `${assetBase}menu-images/veg-biryani.png`,
    price: 99,
  },
  {
    title: "Biryani",
    subtitle: "Rich and spicy",
    image: `${assetBase}menu-images/chicken-biryani.png`,
    price: 49,
  },
  {
    title: "Thali",
    subtitle: "Full meal combo",
    image: `${assetBase}menu-images/paneer-butter-masala.png`,
    price: 69,
  },
  {
    title: "South Indian",
    subtitle: "Light breakfast",
    image: `${assetBase}menu-images/masala-dosa.png`,
    price: 49,
  },
  {
    title: "Dessert",
    subtitle: "Sweet finish",
    image: `${assetBase}menu-images/gulab-jamun.png`,
    price: 99,
  },
  {
    title: "Refreshing",
    subtitle: "Cool sip",
    image: `${assetBase}menu-images/fresh-lime-soda.png`,
    price: 69,
  },
];

const brandNames = [
  "Sagar Gaire Fast Food",
  "Sharma And Vishnu Food",
  "Zam Zam Fast Food",
  "Manohar Dairy & Restaurant",
  "Burger King",
  "Meera's Spice Kitchen",
];

const ACTIVE_ORDER_STORAGE_KEY = "cravings_live_order";
const ACTIVE_ORDER_DISMISS_PREFIX = "cravings_live_order_dismissed";
const QUICK_ORDER_PROMPT_KEY = "cravings_quick_order_prompt_dismissed_v1";

const readStoredLiveOrder = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Could not read live order cache:", error);
    return null;
  }
};

const LiveOrderPopup = ({ order, onClose, onTrack }) => {
  if (!order) return null;

  const deliveryText = order.deliveryAddress
    ? [
        order.deliveryAddress.address,
        order.deliveryAddress.city,
        order.deliveryAddress.state,
      ]
        .filter(Boolean)
        .join(", ")
    : "Delivery address unavailable";

  return (
    <div className="fixed bottom-5 right-5 z-[80] w-[380px] max-w-[calc(100vw-2rem)]">
      <div className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
                Live order
              </p>
              <h3 className="mt-1 text-xl font-black leading-tight">
                {order.liveStatusLabel || "Order placed"}
              </h3>
              <p className="mt-1 text-xs text-white/80">
                {order.trackingCode || "Tracking in progress"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-white/25"
              aria-label="Close order popup"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
              <img
                src={order.restaurantImage}
                alt={order.restaurantName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                {order.restaurantName}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {deliveryText}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Rs {Number(order.total || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.25rem] bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <span>Status</span>
              <span>{order.statusProgress || 0}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${order.statusProgress || 0}%` }}
              />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {order.liveStatusLabel || "Your order is live"}
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={onTrack}
              className="flex-1 rounded-2xl bg-(--color-primary) px-4 py-3 text-sm font-black text-white transition hover:bg-orange-600"
            >
              Track order
            </button>
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Hide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickOrderPopup = ({ onClose, onStartOrder, onBrowseSaved }) => {
  const quickPicks = ["Biryani", "Paneer", "Burger", "Thali"];

  return (
    <div className="fixed bottom-5 right-5 z-[79] w-[390px] max-w-[calc(100vw-2rem)]">
      <div className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
                Quick order
              </p>
              <h3 className="mt-1 text-xl font-black leading-tight">
                Hungry? Start your next order.
              </h3>
              <p className="mt-1 text-xs text-white/85">
                Browse dishes, saved restaurants, and popular picks in one tap.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-white/25"
              aria-label="Close quick order popup"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {quickPicks.map((pick) => (
              <span
                key={pick}
                className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700"
              >
                {pick}
              </span>
            ))}
          </div>

          <div className="mt-4 rounded-[1.25rem] bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Ready in minutes from your favorite local kitchens.
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Jump into the restaurant list or open your saved restaurants and pick
              something delicious.
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={onStartOrder}
              className="flex-1 rounded-2xl bg-(--color-primary) px-4 py-3 text-sm font-black text-white transition hover:bg-orange-600"
            >
              Order now
            </button>
            <button
              onClick={onBrowseSaved}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Saved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quickFilter, setQuickFilter] = useState("all");
  const [sortMode, setSortMode] = useState("relevance");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeOrder, setActiveOrder] = useState(null);
  const [showQuickOrderPopup, setShowQuickOrderPopup] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false);
  const [savedRestaurantIds, setSavedRestaurantIds] = useState([]);

  const formatCuisineList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await api.get("/public/restaurants");

        const restaurantsData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const formattedRestaurants = restaurantsData.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.restaurantName,
          description:
            restaurant.description ||
            `${restaurant.cuisineType} cuisine in ${restaurant.city}`,
          rating: restaurant.rating || 0,
          numReviews: restaurant.numReviews || 0,
          image: getRestaurantCoverImage(
            restaurant.restaurantName,
            restaurant.images?.[0]?.URL ||
              "https://placehold.co/900x600?text=Restaurant",
          ),
          cuisines: formatCuisineList(restaurant.cuisineType),
          city: restaurant.city,
          address: restaurant.address,
          openingHours: restaurant.openingHours,
          closingHours: restaurant.closingHours,
        }));

        setRestaurants(formattedRestaurants);
        setFilteredRestaurants(formattedRestaurants);
      } catch (error) {
        console.error("Error loading restaurants:", error);
        setLoadError("We could not load restaurants right now. Please try again.");
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  useEffect(() => {
    if (!user || user.userType !== "customer") {
      setActiveOrder(null);
      return undefined;
    }

    let cancelled = false;

    const syncActiveOrder = async () => {
      const storedOrder = readStoredLiveOrder();

      if (!storedOrder?.orderId) {
        if (!cancelled) setActiveOrder(null);
        return;
      }

      const dismissedKey = `${ACTIVE_ORDER_DISMISS_PREFIX}_${storedOrder.orderId}`;
      if (localStorage.getItem(dismissedKey)) {
        if (!cancelled) setActiveOrder(null);
        return;
      }

      try {
        const response = await api.get(`/customer/orders/${storedOrder.orderId}`);
        const liveOrder = response.data?.data;

        if (liveOrder?.liveStatus === "delivered") {
          localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
          localStorage.removeItem(dismissedKey);
          if (!cancelled) setActiveOrder(null);
          return;
        }

        if (!cancelled) {
          setActiveOrder({ ...storedOrder, ...liveOrder });
        }
      } catch (error) {
        console.error("Failed to refresh active order:", error);
        if (!cancelled) setActiveOrder(storedOrder);
      }
    };

    syncActiveOrder();
    const interval = setInterval(syncActiveOrder, 8000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (!user || user.userType !== "customer") {
      setCustomerOrders([]);
      return undefined;
    }

    let cancelled = false;

    const loadCustomerOrders = async () => {
      try {
        setCustomerOrdersLoading(true);
        const response = await api.get("/customer/orders");
        if (!cancelled) {
          setCustomerOrders(Array.isArray(response.data?.data) ? response.data.data : []);
        }
      } catch (error) {
        console.error("Failed to load customer orders on home:", error);
        if (!cancelled) setCustomerOrders([]);
      } finally {
        if (!cancelled) setCustomerOrdersLoading(false);
      }
    };

    loadCustomerOrders();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    setSavedRestaurantIds(readFavoriteRestaurantIds());
  }, []);

  useEffect(() => {
    if (!user || user.userType !== "customer") {
      setShowQuickOrderPopup(false);
      return undefined;
    }

    if (activeOrder) {
      setShowQuickOrderPopup(false);
      return undefined;
    }

    const dismissed = localStorage.getItem(QUICK_ORDER_PROMPT_KEY);
    if (dismissed) {
      setShowQuickOrderPopup(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowQuickOrderPopup(true);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [user, activeOrder]);

  const handleCloseOrderPopup = () => {
    if (!activeOrder?.orderId) return;
    localStorage.setItem(`${ACTIVE_ORDER_DISMISS_PREFIX}_${activeOrder.orderId}`, "1");
    setActiveOrder(null);
  };

  const handleCloseQuickOrderPopup = () => {
    localStorage.setItem(QUICK_ORDER_PROMPT_KEY, "1");
    setShowQuickOrderPopup(false);
  };

  const toggleSavedRestaurant = (restaurantId) => {
    setSavedRestaurantIds(toggleFavoriteRestaurantId(restaurantId));
  };

  useEffect(() => {
    let filtered = restaurants;
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      filtered = filtered.filter((restaurant) => {
        const cuisineText = restaurant.cuisines.join(" ").toLowerCase();
        return (
          restaurant.name.toLowerCase().includes(q) ||
          cuisineText.includes(q) ||
          restaurant.city?.toLowerCase().includes(q) ||
          restaurant.description?.toLowerCase().includes(q)
        );
      });
    }

    if (selectedCategory !== "all") {
      const selectedCuisine = categories.find((c) => c.id === selectedCategory)?.keyword;
      filtered = filtered.filter((restaurant) =>
        restaurant.cuisines.some((cuisine) =>
          cuisine.toLowerCase().includes(selectedCuisine),
        ),
      );
    }

    if (quickFilter === "topRated") {
      filtered = filtered.filter((restaurant) => Number(restaurant.rating || 0) >= 4.2);
    }

    if (quickFilter === "saved") {
      filtered = filtered.filter((restaurant) =>
        savedRestaurantIds.includes(restaurant.id),
      );
    }

    if (quickFilter === "mostReviewed") {
      filtered = filtered.sort((a, b) => b.numReviews - a.numReviews);
    }

    setFilteredRestaurants(applySort(filtered));
  }, [searchQuery, selectedCategory, quickFilter, sortMode, restaurants, savedRestaurantIds]);

  const topRestaurants = [...filteredRestaurants]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
  const savedRestaurants = restaurants.filter((restaurant) =>
    savedRestaurantIds.includes(restaurant.id),
  );

  const applySort = (list) => {
    const sorted = [...list];
    if (sortMode === "rating") {
      return sorted.sort((a, b) => b.rating - a.rating);
    }
    if (sortMode === "reviews") {
      return sorted.sort((a, b) => b.numReviews - a.numReviews);
    }
    if (sortMode === "name") {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  };

  const swiggyFilters = [
    { id: "all", label: "All" },
    { id: "topRated", label: "Top Rated" },
    { id: "saved", label: "Saved" },
    { id: "mostReviewed", label: "Most Reviewed" },
  ];

  const topBrandCards = brandNames.map((brandName, index) => {
    const matchedRestaurant =
      restaurants.find((restaurant) =>
        restaurant.name.toLowerCase().includes(brandName.toLowerCase()),
      ) ||
      topRestaurants.find((restaurant) =>
        restaurant.name.toLowerCase().includes(brandName.toLowerCase()),
      );

    return {
      name: brandName,
      time: `${25 + (index % 4) * 2} min`,
      image:
        matchedRestaurant?.image ||
        topRestaurants[index % Math.max(topRestaurants.length, 1)]?.image ||
        `${assetBase}menu-images/veg-biryani.png`,
      restaurantId: matchedRestaurant?.id || null,
    };
  });

  const handleInspirationClick = (title) => {
    navigate(`/order-now?search=${encodeURIComponent(title)}`);
  };

  const customerInsights = useMemo(
    () => buildCustomerInsights(customerOrders),
    [customerOrders],
  );

  const handleReorderRecentOrder = () => {
    if (!customerInsights.recentOrder) return;

    const checkoutData = buildCheckoutDataFromOrder(customerInsights.recentOrder);
    if (!checkoutData) return;

    storeCheckoutData(checkoutData);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#fff7f1] text-(--color-base-content)">
      <LiveOrderPopup
        order={activeOrder}
        onClose={handleCloseOrderPopup}
        onTrack={() => activeOrder?.orderId && navigate(`/track-order/${activeOrder.orderId}`)}
      />
      {showQuickOrderPopup && !activeOrder && (
        <QuickOrderPopup
          onClose={handleCloseQuickOrderPopup}
          onStartOrder={() => {
            handleCloseQuickOrderPopup();
            navigate("/order-now");
          }}
          onBrowseSaved={() => {
            handleCloseQuickOrderPopup();
            navigate("/order-now?saved=1");
          }}
        />
      )}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <CarouselComponent />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/35" />

        <div className="relative z-20 mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
            <FaFireAlt className="text-orange-300" />
            Discover restaurants, dishes, and deals near you
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-[3.8rem]">
                Cravings made
                <span className="block text-orange-300">simple, fast, and local.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
                Search restaurants, explore categories, and order from trusted kitchens
                with a smoother experience built for everyday customers.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/order-now")}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
                >
                  Order now
                  <MdArrowForward size={18} />
                </button>
                {!user && (
                  <button
                    onClick={() => navigate("/register/customer")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15"
                  >
                    Create account
                  </button>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
                  <p className="text-2xl font-black">30 min</p>
                  <p className="mt-1 text-sm text-white/75">Typical delivery window</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
                  <p className="text-2xl font-black">4.5+</p>
                  <p className="mt-1 text-sm text-white/75">Rated customer favorites</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
                  <p className="text-2xl font-black">Live</p>
                  <p className="mt-1 text-sm text-white/75">Order tracking experience</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl lg:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/65">
                    Quick search
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Find your next meal</h2>
                </div>
                <div className="rounded-full bg-orange-500/20 p-3 text-orange-200">
                  <IoBagHandleOutline size={24} />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-slate-900 shadow-lg">
                  <IoSearch className="text-lg text-orange-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restaurants, cuisines, cities..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  onClick={() => navigate("/order-now")}
                  className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-left text-white transition hover:from-orange-600 hover:to-red-600"
                >
                  <div>
                    <p className="text-sm font-semibold">Want something now?</p>
                    <p className="text-xs text-white/75">Jump into the ordering flow</p>
                  </div>
                  <IoChevronForward size={20} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Biryani",
                  "Pizza",
                  "Veg thali",
                  "Dessert",
                  "Burger",
                  "South Indian",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSearchQuery(chip)}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {user?.userType === "customer" && (
        <section className="mx-auto mt-8 max-w-7xl px-4 sm:mt-10 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-orange-200 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                  Your food profile
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  Personalized picks from your order history
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  We surface the restaurants, dishes, and flavors you keep coming back to.
                </p>
              </div>
              <button
                onClick={handleReorderRecentOrder}
                disabled={!customerInsights.recentOrder}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-(--color-primary) px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Quick reorder
                <MdArrowForward />
              </button>
            </div>

            {customerOrdersLoading ? (
              <div className="mt-5 grid place-items-center rounded-[1.5rem] bg-slate-50 py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Loading your profile...
                </p>
              </div>
            ) : customerInsights.totalOrders > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Favorite restaurant
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-900">
                    {customerInsights.favoriteRestaurant?.name || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Ordered {customerInsights.favoriteRestaurant?.count || 0} times
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Favorite cuisine
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-900 capitalize">
                    {customerInsights.favoriteCuisine?.name || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Based on your recent orders
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Favorite item
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-900 line-clamp-1">
                    {customerInsights.favoriteItem?.name || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {customerInsights.favoriteItem?.count || 0} total quantity
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Average spend
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-900">
                    Rs {customerInsights.averageOrderValue.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Across {customerInsights.totalOrders} orders
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">
                  Your personalized recommendations will appear here after your first few orders.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto mt-8 max-w-7xl px-4 pt-6 sm:mt-10 sm:px-6 lg:px-8 lg:pt-8">
        <div className="rounded-[2rem] border border-white/60 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-(--color-primary) text-white shadow-lg shadow-orange-500/20"
                      : "bg-orange-50 text-slate-700 hover:bg-orange-100"
                  }`}
                >
                  <Icon />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {swiggyFilters.map((filter) => {
                const active = quickFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setQuickFilter(filter.id)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "bg-(--color-primary) text-white shadow-lg shadow-orange-500/20"
                        : "bg-orange-50 text-slate-700 hover:bg-orange-100"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500">Sort by</span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="reviews">Most reviewed</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Inspiration for your first order
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Thali, biryani, and more
            </h2>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-3">
          {foodInspirationCards.map((item) => (
            <button
              key={item.title}
              onClick={() => handleInspirationClick(item.title)}
              className="group flex w-36 shrink-0 flex-col items-center text-center transition hover:-translate-y-1"
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white shadow-[0_14px_30px_rgba(0,0,0,0.12)] transition group-hover:-translate-y-1 group-hover:shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <span className="mt-3 inline-flex items-center justify-center rounded-full border-2 border-yellow-300 bg-yellow-300 px-5 py-2 text-xl font-black text-slate-900 shadow-[0_8px_0_rgba(202,138,4,0.35)]">
                ₹{item.price}
              </span>
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {item.title}
              </p>
              <p className="text-xs text-slate-500">{item.subtitle}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Top brands for you
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Popular kitchens in your area
            </h2>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-3">
          {topBrandCards.map((brand) => (
            <button
              key={brand.name}
              onClick={() =>
                brand.restaurantId
                  ? navigate(`/restaurant-menu/${brand.restaurantId}`)
                  : navigate("/order-now")
              }
              className="flex w-44 shrink-0 flex-col items-center rounded-[1.75rem] border border-slate-200 bg-white px-4 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-4 text-base font-bold text-slate-900 line-clamp-2">
                {brand.name}
              </p>
              <p className="mt-2 text-sm text-orange-600">{brand.time}</p>
            </button>
          ))}
        </div>
      </section>

      {savedRestaurants.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-rose-100 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
                  Saved places
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  Restaurants you picked to revisit
                </h2>
              </div>
              <p className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                {savedRestaurants.length} saved
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {savedRestaurants.slice(0, 3).map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50"
                >
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-lg font-black text-slate-900 line-clamp-1">
                      {restaurant.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-1">
                      {restaurant.city || restaurant.address || "Near you"}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button
                        onClick={() => navigate(`/restaurant-menu/${restaurant.id}`)}
                        className="rounded-full bg-(--color-primary) px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                      >
                        View menu
                      </button>
                      <button
                        onClick={() => toggleSavedRestaurant(restaurant.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                      >
                        <IoHeart size={16} />
                        Saved
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Popular near you
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Top picks from trusted restaurants
            </h2>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            {filteredRestaurants.length} restaurant
            {filteredRestaurants.length !== 1 ? "s" : ""} available
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center rounded-[2rem] bg-white py-20 shadow-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading restaurants...
            </p>
          </div>
        ) : loadError ? (
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 py-16 text-center">
            <p className="text-lg font-semibold text-amber-900">
              {loadError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-(--color-primary) px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Retry
            </button>
          </div>
        ) : topRestaurants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {topRestaurants.map((restaurant, cardIndex) => {
              const cuisines = restaurant.cuisines.length
                ? restaurant.cuisines
                : ["Popular"];
              const offerBadges = ["30% OFF", "Rs 150 OFF", "20% OFF", "Free Delivery"];
              const priceTags = ["Rs 100 for one", "Rs 150 for one", "Rs 200 for one", "Rs 250 for one"];
              const deliveryTimes = ["25 min", "28 min", "30 min", "35 min", "41 min"];
              const offer = offerBadges[cardIndex % offerBadges.length];
              const priceTag = priceTags[cardIndex % priceTags.length];
              const deliveryTime = deliveryTimes[cardIndex % deliveryTimes.length];

              return (
                <div
                  key={restaurant.id}
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-col gap-2">
                      <div className="w-fit rounded-md bg-black/35 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                        Promoted
                      </div>
                      <div className="w-fit rounded-md bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                        {offer}
                      </div>
                    </div>
                    <div className="absolute left-4 right-16 bottom-4">
                      <h3 className="text-2xl font-black leading-tight text-white line-clamp-2">
                        {restaurant.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/75 line-clamp-1">
                        {restaurant.city || restaurant.address || "Trusted local kitchen"}
                      </p>
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-900 shadow-lg">
                      <IoStar className="text-yellow-500" />
                      {Number(restaurant.rating || 0).toFixed(1)}
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSavedRestaurant(restaurant.id);
                      }}
                      className="absolute right-4 top-4 rounded-full bg-white/95 p-2 text-rose-500 shadow-lg transition hover:scale-105"
                      aria-label={
                        savedRestaurantIds.includes(restaurant.id)
                          ? "Remove from saved restaurants"
                          : "Save restaurant"
                      }
                    >
                      {savedRestaurantIds.includes(restaurant.id) ? (
                        <IoHeart size={18} />
                      ) : (
                        <IoHeartOutline size={18} />
                      )}
                    </button>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                          {restaurant.description}
                        </p>
                      </div>
                      <div className="rounded-full bg-orange-50 p-2 text-orange-500">
                        <MdVerified size={18} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cuisines.slice(0, 3).map((cuisine) => (
                        <span
                          key={cuisine}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="text-sm text-slate-500">
                        <p className="font-semibold text-slate-700">
                          {priceTag}
                        </p>
                        <p className="mt-1">{restaurant.address || "Delivery available"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">{deliveryTime}</p>
                        <p className="text-xs text-slate-500">{restaurant.numReviews || 0} reviews</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/restaurant-menu/${restaurant.id}`)}
                      className="w-full rounded-full bg-(--color-primary) px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                      View menu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-lg font-semibold text-slate-700">
              No restaurants found for this search.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Try a different keyword or clear the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-6 rounded-full bg-(--color-primary) px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="bg-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                Why customers stay
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Built for comfort and quick decisions
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              A smoother customer journey means less friction, faster browsing,
              and more confidence when ordering.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {discoveryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="inline-flex rounded-2xl bg-(--color-primary) p-4 text-white shadow-lg shadow-orange-500/20">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {card.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#fff7f1] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Customer love
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Real people, real food moments
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Arun J.",
                initials: "AJ",
                text: "The home screen feels much easier now. I can find food faster and the menu cards are clean.",
              },
              {
                name: "Sneha P.",
                initials: "SP",
                text: "It feels like a real delivery app now. The search and categories make a big difference.",
              },
              {
                name: "Raj Kumar",
                initials: "RK",
                text: "The design is more trustworthy and customer friendly. I would happily use it to order again.",
              },
            ].map((review, index) => (
              <div
                key={review.name}
                className="rounded-[1.75rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <IoStar key={i} size={18} />
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {review.text}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-black text-white ${
                      index % 2 === 0 ? "bg-(--color-primary)" : "bg-orange-500"
                    }`}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{review.name}</p>
                    <p className="text-sm text-slate-500">Verified customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-(--color-primary) py-10 text-white sm:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">
              For restaurants too
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Bring more customers to your kitchen.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
              Grow with better reach, more orders, and a platform that makes it
              easier for customers to discover your food.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 rounded-[1.75rem] bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
              <MdVerified size={22} className="text-orange-200" />
              <p className="text-sm font-semibold text-white/90">
                Verified restaurants, better trust
              </p>
            </div>
            <button
              onClick={() => navigate("/register/restaurant")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-(--color-primary) transition hover:bg-orange-50"
            >
              Partner with us
              <MdArrowForward />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
