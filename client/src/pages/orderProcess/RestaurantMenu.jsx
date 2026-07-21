import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack, IoStar } from "react-icons/io5";
import { MdAdd, MdRemove, MdDelete, MdShoppingCart } from "react-icons/md";
import { FaMapLocationDot, FaRegClock } from "react-icons/fa6";
import api from "../../config/ApiConfig";
import { useAuth } from "../../context/AuthContext";

const RestaurantMenu = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
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
          image:
            restaurantData.images?.[0]?.URL ||
            "https://placehold.co/400x200?text=Restaurant",
        });

        // Fetch menu items
        const menuResponse = await api.get(
          `/public/restaurant/${restaurantId}/menu`,
        );
        setMenuItems(menuResponse.data.data.items || []);
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
  }, [restaurantId]);

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
          <div className="flex gap-6 items-start">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-48 h-40 object-cover rounded-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-(--color-content)">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <IoStar className="text-yellow-500" size={18} />
                <span className="font-semibold text-(--color-content)">
                  {restaurant.rating} ({restaurant.numReviews} reviews)
                </span>
              </div>
              <p className="text-(--color-base-content) mb-2">
                {restaurant.cuisineType}
              </p>
              <p className="text-(--color-base-content) mb-2 flex items-center gap-2">
                <FaMapLocationDot />
                {restaurant.address}, {restaurant.city}
              </p>
              <p className="text-(--color-base-content) flex items-center gap-2">
                <FaRegClock />
                {restaurant.openingHours} - {restaurant.closingHours}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Menu Items Section */}
        <div>
          <h2 className="text-2xl font-bold text-(--color-content) mb-6">
            Menu
          </h2>
          {menuItems.length > 0 ? (
            <div className="space-y-3">
              {menuItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-(--color-base-100) rounded-lg shadow-md hover:shadow-lg transition flex gap-4 p-4 border border-(--color-base-200)"
                >
                  {item.image?.url ? (
                    <img
                      src={item.image.url}
                      alt={item.itemName}
                      className="w-28 h-28 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-(--color-base-200) rounded-lg shrink-0 flex items-center justify-center">
                      <MdShoppingCart
                        size={40}
                        className="text-(--color-base-content)"
                      />
                    </div>
                  )}

                  <div className="flex-1 flex justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex  gap-1">
                          <h3 className="font-bold text-(--color-content) text-lg">
                            {item.itemName}
                          </h3>
                          <span className="text-xs bg-(--color-secondary) text-(--color-secondary-content) px-3 py-1 rounded-lg font-semibold ">
                            {item.foodType}
                          </span>
                        </div>
                      </div>
                      <p className="text-(--color-base-content) text-sm">
                        {item.description}
                      </p>
                    </div>

                    <div>
                      <div className="text-lg font-bold text-(--color-primary) whitespace-nowrap">
                        ₹{item.price}
                      </div>
                      <div className="flex items-center gap-3 mt-3">
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
            <div className="flex items-center justify-between">
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
              <div className="text-right">
                <p className="text-xs text-(--color-base-content)">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-(--color-primary)">
                  ₹{(parseFloat(getTotalPrice()) + 50).toFixed(2)}
                </p>
              </div>

              {/* Checkout Button */}
              <button className="bg-(--color-primary) text-(--color-primary-content) px-8 py-3 rounded-lg font-bold hover:opacity-90 transition flex items-center gap-2 whitespace-nowrap ml-4">
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
