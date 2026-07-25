export const CHECKOUT_STORAGE_KEY = "cravings_checkout_data";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeGeolocation = (geolocation = {}) => ({
  lat: toNumber(geolocation.lat),
  lng: toNumber(geolocation.lng),
});

export const buildCheckoutDataFromRestaurant = (restaurant, items = []) => {
  if (!restaurant) return null;

  return {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image || "",
      city: restaurant.city || "",
      address: restaurant.address || "",
      geolocation: normalizeGeolocation(restaurant.geolocation),
    },
    items: items.map((item) => ({
      itemId: item.itemId || item._id || "",
      itemName: item.itemName || item.name || "",
      price: toNumber(item.price),
      quantity: toNumber(item.quantity, 1),
      foodType: item.foodType || "",
      image: item.image?.url || item.image || "",
    })),
    subtotal: items.reduce(
      (sum, item) => sum + toNumber(item.price) * toNumber(item.quantity, 1),
      0,
    ),
  };
};

export const buildCheckoutDataFromOrder = (order) => {
  if (!order) return null;

  const restaurantId = order.restaurantId?._id || order.restaurantId || "";
  const restaurantName =
    order.restaurantName || order.restaurantId?.restaurantName || "";
  const restaurantImage =
    order.restaurantImage ||
    order.restaurantId?.images?.[0]?.URL ||
    "https://placehold.co/400x200?text=Restaurant";
  const restaurantLocation =
    order.restaurantLocation ||
    order.restaurantId?.geolocation ||
    order.restaurantId?.location ||
    {};

  return buildCheckoutDataFromRestaurant(
    {
      id: restaurantId,
      name: restaurantName,
      image: restaurantImage,
      city: order.restaurantId?.city || "",
      address: order.restaurantId?.address || "",
      geolocation: restaurantLocation,
    },
    Array.isArray(order.items) ? order.items : [],
  );
};

export const storeCheckoutData = (checkoutData) => {
  if (!checkoutData) return false;

  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutData));
  return true;
};

export const loadCheckoutData = () => {
  try {
    const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load checkout data:", error);
    return null;
  }
};

