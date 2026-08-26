import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoSearch, IoStar, IoHeartOutline, IoHeart } from "react-icons/io5";
import {
  MdRestaurant,
  MdLocalDining,
  MdFastfood,
  MdCake,
  MdLunchDining,
} from "react-icons/md";
import api from "../../config/ApiConfig";
import { getRestaurantCoverImage } from "../../utils/restaurantCoverImages";
import {
  readFavoriteRestaurantIds,
  toggleFavoriteRestaurantId,
} from "../../utils/favoritesStorage";

const OrderNow = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const [restaurants, setRestaurants] = useState([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dishQuery, setDishQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quickFilter, setQuickFilter] = useState("all");
  const [sortMode, setSortMode] = useState("relevance");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savedRestaurantIds, setSavedRestaurantIds] = useState([]);

  const categories = [
    { id: "all", label: "All", icon: MdRestaurant },
    { id: "veg", label: "Vegetarian", icon: MdLocalDining },
    { id: "nonveg", label: "Non-Veg", icon: MdFastfood },
    { id: "dessert", label: "Desserts", icon: MdCake },
    { id: "others", label: "Others", icon: MdLunchDining },
  ];

  const formatCuisineList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const swiggyFilters = [
    { id: "all", label: "All" },
    { id: "topRated", label: "Top Rated" },
    { id: "saved", label: "Saved" },
    { id: "mostReviewed", label: "Most Reviewed" },
  ];

  const applySort = useCallback((list) => {
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
  }, [sortMode]);

  // Load all restaurants
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
            "https://placehold.co/300x200?text=Restaurant",
          ),
          cuisines: formatCuisineList(restaurant.cuisineType),
          city: restaurant.city,
          address: restaurant.address,
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
    const params = new URLSearchParams(location.search);
    const prefillLocation =
      params.get("location") || params.get("city") || location.state?.location || "";
    const prefillSearch = params.get("search") || location.state?.search || "";
    const prefillDish = params.get("dish") || location.state?.dish || "";

    setLocationQuery(prefillLocation);
    setSearchQuery(prefillSearch);
    setDishQuery(prefillDish);
  }, [location.search, location.state]);

  useEffect(() => {
    setSavedRestaurantIds(readFavoriteRestaurantIds());
  }, []);

  const toggleSavedRestaurant = (restaurantId) => {
    setSavedRestaurantIds(toggleFavoriteRestaurantId(restaurantId));
  };

  // Filter restaurants
  useEffect(() => {
    let filtered = restaurants;
    const locationQ = locationQuery.trim().toLowerCase();
    const searchQ = searchQuery.trim().toLowerCase();

    if (locationQ) {
      filtered = filtered.filter(
        (r) =>
          r.city?.toLowerCase().includes(locationQ) ||
          r.address?.toLowerCase().includes(locationQ),
      );
    }

    if (searchQ) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQ) ||
          r.cuisines.some((c) => c.toLowerCase().includes(searchQ)) ||
          r.city.toLowerCase().includes(searchQ) ||
          r.address?.toLowerCase().includes(searchQ) ||
          r.description?.toLowerCase().includes(searchQ),
      );
    }

    if (selectedCategory !== "all") {
      const categoryMap = {
        veg: "vegetarian",
        nonveg: "non-vegetarian",
        dessert: "desserts",
        others: "other",
      };

      const selectedCuisine = categoryMap[selectedCategory];
      filtered = filtered.filter((r) =>
        r.cuisines.some((c) => c.toLowerCase().includes(selectedCuisine)),
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
  }, [
    locationQuery,
    searchQuery,
    dishQuery,
    selectedCategory,
    quickFilter,
    sortMode,
    restaurants,
    savedRestaurantIds,
    applySort,
  ]);

  return (
    <div className="min-h-screen bg-(--color-base-200) p-2">
      {/* Header */}
      <div className="bg-(--color-base-100) rounded-2xl shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center bg-(--color-base-100) rounded-lg px-4 py-3 border border-(--color-primary)">
            <IoSearch className="text-(--color-base-content) text-xl mr-3" />
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search by dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-(--color-base-100) w-full outline-none text-(--color-primary)"
              />
              <span className="hidden h-5 w-px bg-gray-200 sm:block" />
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="bg-(--color-base-100) w-full outline-none text-(--color-primary)"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {swiggyFilters.map((filter) => {
                const active = quickFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setQuickFilter(filter.id)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${active
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-(--color-content) mb-2">
            {dishQuery
              ? `Restaurants for ${dishQuery}`
              : selectedCategory === "all"
                ? "All Restaurants"
                : `${categories.find((c) => c.id === selectedCategory)?.label} Restaurants`}
          </h2>
          <p className="text-(--color-base-content)">
            {dishQuery ? `Choose a restaurant and find ${dishQuery} in its menu.` : `${filteredRestaurants.length} restaurant`}
            {!dishQuery && (filteredRestaurants.length !== 1 ? "s" : "")} {!dishQuery && "available"}
          </p>
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-(--color-primary)"></div>
            <p className="mt-4 text-(--color-base-content)">
              Loading restaurants...
            </p>
          </div>
        ) : loadError ? (
          <div className="text-center py-12 bg-(--color-base-100) rounded-lg">
            <p className="text-(--color-base-content) text-lg">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-(--color-primary) text-(--color-primary-content) px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Retry
            </button>
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="flex flex-col bg-(--color-base-100) rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
              >
                {/* Restaurant cover photo */}
                <div className="relative h-56 overflow-hidden bg-(--color-base-200)">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/75">
                        Restaurant
                      </p>
                      <h3 className="mt-1 text-2xl font-black leading-tight text-white line-clamp-2">
                        {restaurant.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/80 line-clamp-1">
                        {restaurant.city || restaurant.address || "Available nearby"}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-black text-slate-900 shadow-lg">
                      <IoStar size={16} />
                      {restaurant.rating}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSavedRestaurant(restaurant.id)}
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

                {/* Restaurant Info */}
                <div className="flex flex-col flex-1 p-4">
                  <p className="text-(--color-base-content) text-sm mb-3">
                    {restaurant.description}
                  </p>

                  {/* Cuisines */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.cuisines.map((cuisine, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-(--color-base-200) text-(--color-base-content) px-2 py-1 rounded capitalize"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>

                  {/* Footer Info */}
                  <div className="mt-auto pt-3 border-t border-(--color-base-200)">
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          navigate(`/restaurant-menu/${restaurant.id}${dishQuery ? `?dish=${encodeURIComponent(dishQuery)}` : ""}`)
                        }
                        className="flex-1 bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                      >
                        View Menu
                      </button>
                      <button
                        onClick={() => toggleSavedRestaurant(restaurant.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        {savedRestaurantIds.includes(restaurant.id)
                          ? "Saved"
                          : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-(--color-base-100) rounded-lg">
            <p className="text-(--color-base-content) text-lg">
              No restaurants found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setLocationQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 bg-(--color-primary) text-(--color-primary-content) px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderNow;
