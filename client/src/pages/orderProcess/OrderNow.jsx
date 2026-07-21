import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearch, IoStar } from "react-icons/io5";
import {
  MdRestaurant,
  MdLocalDining,
  MdFastfood,
  MdCake,
  MdLunchDining,
} from "react-icons/md";
import api from "../../config/ApiConfig";

const OrderNow = () => {
  const navigate = useNavigate();

  // States
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "All", icon: MdRestaurant },
    { id: "veg", label: "Vegetarian", icon: MdLocalDining },
    { id: "nonveg", label: "Non-Veg", icon: MdFastfood },
    { id: "dessert", label: "Desserts", icon: MdCake },
    { id: "others", label: "Others", icon: MdLunchDining },
  ];

  // Load all restaurants
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        const response = await api.get("/public/restaurants");

        const formattedRestaurants = response.data.data.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.restaurantName,
          description:
            restaurant.description ||
            `${restaurant.cuisineType} cuisine in ${restaurant.city}`,
          rating: restaurant.rating || 0,
          numReviews: restaurant.numReviews || 0,
          image:
            restaurant.images?.[0]?.URL ||
            "https://placehold.co/300x200?text=Restaurant",
          cuisines: restaurant.cuisineType.split(",").map((c) => c.trim()),
          city: restaurant.city,
          address: restaurant.address,
        }));

        setRestaurants(formattedRestaurants);
        setFilteredRestaurants(formattedRestaurants);
      } catch (error) {
        console.error("Error loading restaurants:", error);
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  // Filter restaurants
  useEffect(() => {
    let filtered = restaurants;

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.cuisines.some((c) =>
            c.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          r.city.toLowerCase().includes(searchQuery.toLowerCase()),
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

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCategory, restaurants]);

  return (
    <div className="min-h-screen bg-(--color-base-200) p-2">
      {/* Header */}
      <div className="bg-(--color-base-100) rounded-2xl shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center bg-(--color-base-100) rounded-lg px-4 py-3 border border-(--color-primary)">
            <IoSearch className="text-(--color-base-content) text-xl mr-3" />
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-(--color-base-100) w-full outline-none text-(--color-primary)"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-(--color-content) mb-2">
            {selectedCategory === "all"
              ? "All Restaurants"
              : `${categories.find((c) => c.id === selectedCategory)?.label} Restaurants`}
          </h2>
          <p className="text-(--color-base-content)">
            {filteredRestaurants.length} restaurant
            {filteredRestaurants.length !== 1 ? "s" : ""} available
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
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="flex flex-col bg-(--color-base-100) rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
              >
                {/* Restaurant Image */}
                <div className="relative h-48 overflow-hidden bg-(--color-base-200)">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded-full flex items-center gap-1 font-semibold text-sm">
                    <IoStar size={16} />
                    {restaurant.rating}
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="font-bold text-(--color-content) text-lg mb-1">
                    {restaurant.name}
                  </h3>
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
                    <button
                      onClick={() =>
                        navigate(`/restaurant-menu/${restaurant.id}`)
                      }
                      className="w-full bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      View Menu
                    </button>
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
