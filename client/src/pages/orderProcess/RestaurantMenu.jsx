import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoArrowBack, IoStar } from "react-icons/io5";
import { MdAdd, MdRemove, MdDelete, MdShoppingCart } from "react-icons/md";
import api from "../../config/ApiConfig";
import useAuth from "../../context/useAuth";
import { getRestaurantCoverImage } from "../../utils/restaurantCoverImages";
import {
  buildCheckoutDataFromRestaurant,
  storeCheckoutData,
} from "../../utils/checkoutStorage";

const RestaurantMenu = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const location = useLocation();
  const requestedDish = new URLSearchParams(location.search).get("dish") || "";
  const { user } = useAuth();

  // States
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Load restaurant and menu data
  useEffect(() => {
    const loadRestaurantAndMenu = async () => {
      try {
        setLoading(true);

        // Fetch restaurant details
        const restaurantResponse = await api.get(
          `/public/restaurant/${restaurantId}`,
        );
        const restaurantData = restaurantResponse.data.data;

        setRestaurant({
          id: restaurantData._id,
          name: restaurantData.restaurantName,
          address: restaurantData.address,
          city: restaurantData.city,
          cuisineType: restaurantData.cuisineType,
          openingHours: restaurantData.openingHours,
          closingHours: restaurantData.closingHours,
          description: restaurantData.description,
          rating: restaurantData.rating || 0,
          numReviews: restaurantData.numReviews || 0,
          geolocation: restaurantData.geolocation,
          image: getRestaurantCoverImage(
            restaurantData.restaurantName,
            restaurantData.images?.[0]?.URL ||
              "https://placehold.co/400x200?text=Restaurant",
          ),
        });

        // Fetch menu items
        const menuResponse = await api.get(
          `/public/restaurant/${restaurantId}/menu`,
        );
        const allItems = menuResponse.data.data.items || [];
        const requestedDish = new URLSearchParams(location.search).get("dish")?.trim().toLowerCase();
        const matchingItems = requestedDish
          ? allItems.filter((item) => `${item.itemName} ${item.description} ${item.foodType}`.toLowerCase().includes(requestedDish))
          : allItems;
        setMenuItems(matchingItems);
      } catch (error) {
        console.error("Error loading restaurant or menu:", error);
        setRestaurant(null);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      loadRestaurantAndMenu();
    }
  }, [restaurantId, location.search]);

  // Add to cart
  const addToCart = (item) => {
    const existingItem = cart.find((c) => c.itemName === item.itemName);
    if (existingItem) {
      existingItem.quantity += 1;
      setCart([...cart]);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove from cart
  const removeFromCart = (itemName) => {
    setCart(cart.filter((item) => item.itemName !== itemName));
  };

  // Update cart quantity
  const updateCartQuantity = (itemName, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemName);
    } else {
      const item = cart.find((c) => c.itemName === itemName);
      if (item) {
        item.quantity = quantity;
        setCart([...cart]);
      }
    }
  };

  const getTotalPrice = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const checkoutPayload = buildCheckoutDataFromRestaurant(restaurant, cart);
    storeCheckoutData(checkoutPayload);
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-(--color-base-200) flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-(--color-primary)"></div>
          <p className="mt-4 text-(--color-base-content)">
            Loading restaurant menu...
          </p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-(--color-base-200) flex items-center justify-center">
        <div className="text-center">
          <p className="text-(--color-base-content) text-lg mb-4">
            Restaurant not found
          </p>
          <button
            onClick={() => navigate("/order-now")}
            className="bg-(--color-primary) text-(--color-primary-content) px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-base-200)">
      {/* Header */}
      <div className="bg-(--color-base-100) shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/order-now")}
            className="flex items-center gap-2 text-(--color-primary) hover:text-(--color-primary-focus) font-semibold mb-4"
          >
            <IoArrowBack size={20} />
            Back to Restaurants
          </button>
          <div className="relative overflow-hidden rounded-[2rem] border border-(--color-base-200) bg-slate-900 shadow-xl">
            <div className="relative h-72 sm:h-80">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
              <div className="absolute left-0 right-0 bottom-0 flex flex-col gap-4 p-6 text-white md:flex-row md:items-end md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
                    Restaurant cover
                  </p>
                  <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                    {restaurant.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                    {restaurant.address}, {restaurant.city}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {restaurant.cuisineType}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {restaurant.openingHours} - {restaurant.closingHours}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {restaurant.numReviews} reviews
                    </span>
                  </div>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-lg">
                  <IoStar className="text-yellow-500" size={18} />
                  {restaurant.rating}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Menu Items Section */}
        <div>
          <h2 className="text-2xl font-bold text-(--color-content) mb-6">
            {requestedDish ? `${requestedDish} options` : "Menu"}
          </h2>
          {requestedDish && menuItems.length === 0 && (
            <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
              This restaurant does not have a matching {requestedDish} item. Use the back button to try another restaurant.
            </div>
          )}
          {menuItems.length > 0 ? (
            <div className="space-y-3">
              {menuItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-(--color-base-100) rounded-2xl shadow-md hover:shadow-lg transition flex flex-col md:flex-row gap-4 p-4 border border-(--color-base-200)"
                >
                  {item.image?.url ? (
                    <img
                      src={item.image.url}
                      alt={item.itemName}
                      className="w-full md:w-28 h-48 md:h-28 object-cover rounded-xl shrink-0"
                    />
                  ) : (
                    <div className="w-full md:w-28 h-48 md:h-28 bg-(--color-base-200) rounded-xl shrink-0 flex items-center justify-center">
                      <MdShoppingCart
                        size={40}
                        className="text-(--color-base-content)"
                      />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col gap-4 md:flex-row md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-(--color-content) text-lg">
                            {item.itemName}
                          </h3>
                          <span className="text-xs bg-(--color-secondary) text-(--color-secondary-content) px-3 py-1 rounded-lg font-semibold">
                            {item.foodType}
                          </span>
                        </div>
                      </div>
                      <p className="text-(--color-base-content) text-sm">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-start">
                      <div className="text-lg font-bold text-(--color-primary) whitespace-nowrap">
                        ₹{item.price}
                      </div>
                      <div className="flex items-center gap-3 md:mt-3">
                        {cart.find((c) => c.itemName === item.itemName) ? (
                          <div className="flex items-center gap-2 bg-(--color-base-200) rounded-lg px-3 py-2">
                            <button
                              onClick={() => {
                                const cartItem = cart.find(
                                  (c) => c.itemName === item.itemName,
                                );
                                updateCartQuantity(
                                  item.itemName,
                                  cartItem.quantity - 1,
                                );
                              }}
                              className="text-(--color-primary) hover:opacity-70 transition"
                            >
                              <MdRemove size={18} />
                            </button>
                            <span className="font-semibold text-(--color-content) w-6 text-center">
                              {
                                cart.find((c) => c.itemName === item.itemName)
                                  ?.quantity
                              }
                            </span>
                            <button
                              onClick={() => {
                                const cartItem = cart.find(
                                  (c) => c.itemName === item.itemName,
                                );
                                updateCartQuantity(
                                  item.itemName,
                                  cartItem.quantity + 1,
                                );
                              }}
                              className="text-(--color-primary) hover:opacity-70 transition"
                            >
                              <MdAdd size={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                          >
                            <MdAdd size={18} />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-(--color-base-100) rounded-lg border border-(--color-base-200)">
              <p className="text-(--color-base-content) text-lg">
                No menu items available at this moment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart at Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-(--color-base-100) border-t border-(--color-base-200) shadow-lg z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Item Count */}
              <div className="flex items-center gap-3">
                <div className="bg-(--color-primary) text-(--color-primary-content) rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                <div>
                  <p className="text-xs text-(--color-base-content)">
                    Items in Cart
                  </p>
                  <p className="font-semibold text-(--color-content)">
                    {cart.length} item{cart.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="text-left sm:text-right">
                <p className="text-xs text-(--color-base-content)">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-(--color-primary)">
                  ₹{(parseFloat(getTotalPrice()) + 50).toFixed(2)}
                </p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full sm:w-auto bg-(--color-primary) text-(--color-primary-content) px-8 py-3 rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2 whitespace-nowrap sm:ml-4"
              >
                <MdShoppingCart size={20} />
                {user ? "Checkout" : "Login to Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
