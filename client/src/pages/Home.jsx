import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoBagHandleOutline,
  IoChevronBack,
  IoChevronForward,
  IoHeart,
  IoHeartOutline,
  IoSearch,
  IoStar,
  IoTimeOutline,
} from "react-icons/io5";
import { FaFireAlt, FaMotorcycle, FaShieldAlt } from "react-icons/fa";
import {
  MdArrowForward,
  MdCake,
  MdFastfood,
  MdLunchDining,
  MdLocalDining,
  MdRestaurant,
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
    title: "Quick delivery",
    text: "Fast-moving kitchens, real-time tracking, and warm food at the end.",
  },
  {
    icon: FaShieldAlt,
    title: "Trusted restaurants",
    text: "Clean, verified listings with ratings, reviews, and local favorites.",
  },
  {
    icon: IoTimeOutline,
    title: "Easy reordering",
    text: "Return to the dishes and restaurants you already love in a tap.",
  },
];

const moodCards = [
  {
    label: "Comfort food",
    description: "Rich, filling, and familiar",
    search: "biryani",
    image: `${assetBase}menu-images/chicken-biryani.png`,
    tone: "from-orange-500 to-red-500",
  },
  {
    label: "Fresh start",
    description: "Lighter meals and daytime favorites",
    search: "south indian",
    image: `${assetBase}menu-images/masala-dosa.png`,
    tone: "from-emerald-500 to-teal-600",
  },
  {
    label: "Sweet finish",
    description: "Desserts and something just for you",
    search: "dessert",
    image: `${assetBase}menu-images/gulab-jamun.png`,
    tone: "from-pink-500 to-rose-500",
  },
];

const highlightStats = [
  { value: "30 min", label: "typical delivery window" },
  { value: "4.5+", label: "favorite restaurants" },
  { value: "Live", label: "tracking on active orders" },
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
    ? [order.deliveryAddress.address, order.deliveryAddress.city, order.deliveryAddress.state]
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
  const [dishShowcaseVisible, setDishShowcaseVisible] = useState(false);
  const dishShowcaseRef = useRef(null);
  const brandCarouselRef = useRef(null);

  useEffect(() => {
    const showcase = dishShowcaseRef.current;
    if (!showcase || !("IntersectionObserver" in window)) {
      setDishShowcaseVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDishShowcaseVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(showcase);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await api.get("/public/restaurants");
        const restaurantsData = Array.isArray(response.data?.data) ? response.data.data : [];

        const formattedRestaurants = restaurantsData.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.restaurantName,
          description:
            restaurant.description ||
            `${restaurant.cuisineType} cuisine in ${restaurant.city}`,
          rating: Number(restaurant.rating) || 0,
          numReviews: Number(restaurant.numReviews) || 0,
          image: getRestaurantCoverImage(
            restaurant.restaurantName,
            restaurant.images?.[0]?.URL || "https://placehold.co/900x600?text=Restaurant",
          ),
          cuisines: Array.isArray(restaurant.cuisineType)
            ? restaurant.cuisineType
            : String(restaurant.cuisineType || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          city: restaurant.city,
          address: restaurant.address,
          openingHours: restaurant.openingHours,
          closingHours: restaurant.closingHours,
        }));

        setRestaurants(formattedRestaurants);
      } catch (error) {
        console.error("Error loading restaurants:", error);
        setLoadError("We could not load restaurants right now. Please try again.");
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  useEffect(() => {
    setSavedRestaurantIds(readFavoriteRestaurantIds());
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
    if (!user || user.userType !== "customer") {
      setShowQuickOrderPopup(false);
      return undefined;
    }

    if (activeOrder) {
      setShowQuickOrderPopup(false);
      return undefined;
    }

    if (localStorage.getItem(QUICK_ORDER_PROMPT_KEY)) {
      setShowQuickOrderPopup(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowQuickOrderPopup(true);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [user, activeOrder]);

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = [...restaurants];

    if (query) {
      list = list.filter((restaurant) => {
        const cuisineText = restaurant.cuisines.join(" ").toLowerCase();
        return (
          restaurant.name.toLowerCase().includes(query) ||
          cuisineText.includes(query) ||
          restaurant.city?.toLowerCase().includes(query) ||
          restaurant.description?.toLowerCase().includes(query)
        );
      });
    }

    if (selectedCategory !== "all") {
      const selectedCuisine = categories.find((c) => c.id === selectedCategory)?.keyword;
      list = list.filter((restaurant) =>
        restaurant.cuisines.some((cuisine) =>
          cuisine.toLowerCase().includes(selectedCuisine),
        ),
      );
    }

    if (quickFilter === "topRated") {
      list = list.filter((restaurant) => restaurant.rating >= 4.2);
    }

    if (quickFilter === "saved") {
      list = list.filter((restaurant) => savedRestaurantIds.includes(restaurant.id));
    }

    if (quickFilter === "mostReviewed") {
      list = [...list].sort((a, b) => b.numReviews - a.numReviews);
    }

    const sorted = [...list];
    if (sortMode === "rating") return sorted.sort((a, b) => b.rating - a.rating);
    if (sortMode === "reviews") return sorted.sort((a, b) => b.numReviews - a.numReviews);
    if (sortMode === "name") return sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [searchQuery, restaurants, selectedCategory, quickFilter, sortMode, savedRestaurantIds]);

  const topRestaurants = filteredRestaurants.slice(0, 6);
  const savedRestaurants = restaurants.filter((restaurant) =>
    savedRestaurantIds.includes(restaurant.id),
  );
  const customerInsights = useMemo(
    () => buildCustomerInsights(customerOrders),
    [customerOrders],
  );

  const toggleSavedRestaurant = (restaurantId) => {
    setSavedRestaurantIds(toggleFavoriteRestaurantId(restaurantId));
  };

  const handleCloseOrderPopup = () => {
    if (!activeOrder?.orderId) return;
    localStorage.setItem(`${ACTIVE_ORDER_DISMISS_PREFIX}_${activeOrder.orderId}`, "1");
    setActiveOrder(null);
  };

  const handleCloseQuickOrderPopup = () => {
    localStorage.setItem(QUICK_ORDER_PROMPT_KEY, "1");
    setShowQuickOrderPopup(false);
  };

  const handleReorderRecentOrder = () => {
    if (!customerInsights.recentOrder) return;

    const checkoutData = buildCheckoutDataFromOrder(customerInsights.recentOrder);
    if (!checkoutData) return;

    storeCheckoutData(checkoutData);
    navigate("/checkout");
  };

  const scrollBrandCarousel = (direction) => {
    brandCarouselRef.current?.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

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
      image: getRestaurantCoverImage(brandName, `${assetBase}aboutPage.png`),
      restaurantId: matchedRestaurant?.id || null,
    };
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.12),_transparent_30%),linear-gradient(180deg,_#fffaf5_0%,_#fff5eb_40%,_#fffdfa_100%)] text-(--color-base-content)">
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
        <div className="pointer-events-none absolute inset-0 z-0">
          <CarouselComponent />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/82 via-black/56 to-black/28" />

        <div className="relative z-10 mx-auto grid min-h-[64vh] max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
              <FaFireAlt className="text-orange-300" />
              Discover restaurants, dishes, and deals near you
            </div>

            <p className="text-sm font-bold tracking-[0.22em] text-orange-200">
              {user?.userType === "customer"
                ? `Welcome back${user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋`
                : "Your local food playground"}
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-black tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Good food,
              <span className="block text-orange-300">good mood.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-6 text-white/82 sm:text-lg">
              Search restaurants, explore moods, and order from trusted kitchens with
              a smoother experience that feels crafted, not crowded.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2.5 text-slate-900 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                <IoSearch className="text-lg text-orange-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search restaurants, cuisines, or dishes"
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={() =>
                  navigate(
                    searchQuery.trim()
                      ? `/order-now?search=${encodeURIComponent(searchQuery.trim())}`
                      : "/order-now",
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
              >
                Explore food
                <MdArrowForward size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Biryani", "Pizza", "Thali", "Dessert", "Burger", "South Indian"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSearchQuery(chip)}
                  className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {highlightStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md"
                >
                  <p className="text-xl font-black">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/75">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md justify-self-end rounded-[2rem] border border-white/15 bg-white/10 p-3.5 shadow-2xl backdrop-blur-xl lg:p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/65">
                  Quick search
                </p>
                <h2 className="mt-1 text-xl font-black">Find your next meal</h2>
              </div>
              <div className="rounded-full bg-orange-500/20 p-2.5 text-orange-200">
                <IoBagHandleOutline size={22} />
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              {["all", "topRated", "saved", "mostReviewed"].map((filter) => {
                const filterLabel = {
                  all: "All restaurants",
                  topRated: "Top rated",
                  saved: "Saved favorites",
                  mostReviewed: "Most reviewed",
                }[filter];

                return (
                  <button
                    key={filter}
                    onClick={() => setQuickFilter(filter)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${quickFilter === filter
                      ? "bg-white text-slate-900 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/15"
                      }`}
                  >
                    <span className="text-sm font-bold">{filterLabel}</span>
                    <MdArrowForward
                      className={quickFilter === filter ? "text-orange-500" : "text-white/70"}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-3 rounded-[1.25rem] bg-white p-3.5 text-slate-900 shadow-lg">
              <p className="text-sm font-semibold">
                Search, filter, and save restaurants without losing your place.
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                The page updates instantly, so you can compare options and jump straight
                into ordering.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-white/70 bg-white p-4 shadow-[0_20px_60px_rgba(113,52,18,0.14)] sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                What are you craving?
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Pick a mood. We&apos;ll find the food.
              </h2>
            </div>
            <button
              onClick={() => navigate("/order-now")}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              See all menus
              <MdArrowForward />
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {moodCards.map((mood) => (
              <button
                key={mood.label}
                onClick={() => navigate(`/order-now?search=${encodeURIComponent(mood.search)}`)}
                className="group relative flex min-h-28 items-center overflow-hidden rounded-2xl bg-slate-900 p-4 text-left text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${mood.tone} opacity-90`} />
                <img
                  src={mood.image}
                  alt=""
                  className="absolute right-0 h-full w-32 object-cover opacity-80 mix-blend-screen transition duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="relative z-10 max-w-[70%]">
                  <p className="font-black">{mood.label}</p>
                  <p className="mt-1 text-xs text-white/80">{mood.description}</p>
                </div>
                <span className="absolute bottom-3 right-3 rounded-full bg-white/20 px-2 py-1 text-xs font-bold backdrop-blur">
                  Go →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2b120b] via-[#5b2110] to-orange-600 px-6 py-8 text-white shadow-[0_24px_70px_rgba(113,52,18,0.2)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">
          <div className="relative z-10 max-w-lg">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-200">
              Featured craving
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Meet your next favorite bite.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
              Explore the bakery and snack experience when you want something playful,
              warm, and easy to order.
            </p>
            <button
              onClick={() => navigate("/bakery-crav")}
              className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-black text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-50"
            >
              Order these snacks
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:mt-0 lg:grid-cols-2">
            {[
              { title: "Popcorn", image: `${assetBase}menu-images/fresh-lime-soda.png` },
              { title: "Pastry", image: `${assetBase}menu-images/gulab-jamun.png` },
            ].map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => navigate("/bakery-crav")}
                className="relative overflow-hidden rounded-[1.5rem] bg-white/10 p-4 text-left backdrop-blur-md transition hover:-translate-y-1"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-40 w-full rounded-[1.25rem] object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-100">
                      BakeryCrav
                    </p>
                    <h3 className="text-xl font-black">{item.title}</h3>
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-2 text-xs font-bold">
                    Order
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section ref={dishShowcaseRef} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div
          className={`mb-7 flex flex-col gap-3 transition-all duration-700 sm:flex-row sm:items-end sm:justify-between ${dishShowcaseVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Restaurant spotlight
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Top picks from trusted kitchens
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Browse the most loved restaurants nearby, then save the places you want to
              revisit later.
            </p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            {filteredRestaurants.length} restaurant
            {filteredRestaurants.length !== 1 ? "s" : ""} available
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${active
                  ? "bg-(--color-primary) text-white shadow-lg shadow-orange-500/20"
                  : "bg-white text-slate-700 shadow-sm hover:bg-orange-50"
                  }`}
              >
                <Icon />
                {category.label}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm">
            {["relevance", "rating", "reviews", "name"].map((mode) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition ${sortMode === mode
                  ? "bg-orange-100 text-orange-700"
                  : "text-slate-500 hover:bg-slate-100"
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center rounded-[2rem] bg-white py-20 shadow-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading restaurants...</p>
          </div>
        ) : loadError ? (
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 py-16 text-center">
            <p className="text-lg font-semibold text-amber-900">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-(--color-primary) px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Retry
            </button>
          </div>
        ) : topRestaurants.length > 0 ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {topRestaurants.map((restaurant) => {
              const cuisines = restaurant.cuisines.length ? restaurant.cuisines : ["Popular"];
              const isSaved = savedRestaurantIds.includes(restaurant.id);

              return (
                <div
                  key={restaurant.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-left shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(190,24,93,0.16)]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      Trusted pick
                    </div>
                    <div className="absolute left-4 right-16 bottom-4">
                      <h3 className="text-[1.7rem] font-black leading-tight text-white line-clamp-2">
                        {restaurant.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/75 line-clamp-1">
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
                      aria-label={isSaved ? "Remove from saved restaurants" : "Save restaurant"}
                    >
                      {isSaved ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <p className="mt-1 text-sm leading-6 text-slate-500 line-clamp-3">
                        {restaurant.description}
                      </p>
                      <div className="rounded-full bg-orange-50 p-2 text-orange-500">
                        <MdVerified size={18} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cuisines.slice(0, 3).map((cuisine) => (
                        <span
                          key={cuisine}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-600"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="text-sm text-slate-500">
                        <p className="font-semibold text-slate-700">
                          Rs {100 + (restaurant.numReviews % 4) * 50} for one
                        </p>
                        <p className="mt-1">{restaurant.address || "Delivery available"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">25-35 min</p>
                        <p className="text-xs text-slate-500">{restaurant.numReviews || 0} reviews</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/restaurant-menu/${restaurant.id}`)}
                      className="w-full rounded-full bg-(--color-primary) px-4 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
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
                setQuickFilter("all");
              }}
              className="mt-6 rounded-full bg-(--color-primary) px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Clear filters
            </button>
          </div>
        )}
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

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {savedRestaurants.slice(0, 3).map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-sm"
                >
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="p-5">
                    <p className="text-xl font-black text-slate-900 line-clamp-1">
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
                  <p className="mt-2 text-xl font-black capitalize text-slate-900">
                    {customerInsights.favoriteCuisine?.name || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Based on your recent orders</p>
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
                  Your personalized recommendations will appear here after your first few
                  orders.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-white/70 py-8 backdrop-blur-sm sm:py-12">
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
              A smoother customer journey means less friction, faster browsing, and
              more confidence when ordering.
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
                  <h3 className="mt-5 text-xl font-black text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{card.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#fff7f1] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                Top brands for you
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Popular kitchens in your area
              </h2>
              <p className="mt-2 text-sm text-slate-500">Explore nearby restaurants picked for you.</p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollBrandCarousel(-1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-orange-200 bg-white text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Show previous restaurants"
              >
                <IoChevronBack size={21} />
              </button>
              <button
                type="button"
                onClick={() => scrollBrandCarousel(1)}
                className="grid h-11 w-11 place-items-center rounded-full bg-orange-600 text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Show more restaurants"
              >
                <IoChevronForward size={21} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-[#fff7f1] to-transparent sm:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-[#fff7f1] to-transparent sm:block" />
            <div ref={brandCarouselRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-5 pt-1 [scrollbar-width:thin]">
            {topBrandCards.map((brand) => (
              <button
                key={brand.name}
                onClick={() =>
                  brand.restaurantId
                    ? navigate(`/restaurant-menu/${brand.restaurantId}`)
                    : navigate("/order-now")
                }
                className="group w-60 shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = `${assetBase}aboutPage.png`;
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
                </div>
                <div className="p-4">
                  <p className="min-h-12 text-lg font-black leading-6 text-slate-900 line-clamp-2">
                    {brand.name}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-orange-600">{brand.time}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition group-hover:text-orange-600">View menu <IoChevronForward /></span>
                  </div>
                </div>
              </button>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-orange-600 to-red-600 py-10 text-white sm:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">
              For restaurants too
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Bring more customers to your kitchen.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
              Grow with better reach, more orders, and a platform that makes it easier
              for customers to discover your food.
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

