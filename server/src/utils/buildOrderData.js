import MenuItem from "../model/menuModel.js";
import Restaurant from "../model/restaurantModel.js";

const bakeryCatalog = new Map([
  ["bakery-cake", { itemName: "Celebration Cake", price: 299 }],
  ["bakery-pastry", { itemName: "Fresh Pastry", price: 99 }],
  ["bakery-kurkure", { itemName: "Kurkure Crunch", price: 49 }],
  ["bakery-pizza", { itemName: "Loaded Pizza", price: 249 }],
  ["bakery-burger", { itemName: "Classic Burger", price: 199 }],
  ["bakery-popcorn", { itemName: "Movie Popcorn", price: 129 }],
]);

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

export const buildOrderData = async (customerId, payload = {}) => {
  const { restaurantId, deliveryAddress, items } = payload;
  if (!restaurantId) throw badRequest("Restaurant information is required");
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) throw badRequest("Cart must contain between 1 and 50 items");
  if (!deliveryAddress?.address || !deliveryAddress?.geolocation) throw badRequest("Delivery address is required");

  const isBakery = restaurantId === "bakery-crav";
  const restaurant = isBakery ? null : await Restaurant.findById(restaurantId).select("restaurantName images geolocation");
  if (!restaurant && !isBakery) throw Object.assign(new Error("Restaurant not found"), { status: 404 });

  const menu = isBakery ? null : await MenuItem.findOne({ restaurantId }).select("items");
  const normalizedItems = items.map((requestedItem) => {
    const quantity = Number(requestedItem.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw badRequest("Item quantity must be between 1 and 20");
    const itemId = String(requestedItem.itemId || requestedItem._id || "");
    const item = isBakery
      ? bakeryCatalog.get(itemId)
      : menu?.items?.find((menuItem) => String(menuItem._id) === itemId && menuItem.isAvailable && !menuItem.isDiscontinued);
    if (!item) throw badRequest("One or more cart items are unavailable. Refresh the menu and try again.");
    return {
      itemId,
      itemName: item.itemName,
      price: Number(item.price),
      quantity,
      foodType: item.foodType || "",
      image: isBakery ? "" : item.image?.url || "",
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 30;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + deliveryFee + tax).toFixed(2));
  return {
    customerId,
    ...(isBakery ? {} : { restaurantId }),
    restaurantName: isBakery ? "BakeryCrav" : restaurant.restaurantName,
    restaurantImage: restaurant?.images?.[0]?.URL || "https://placehold.co/400x200?text=Restaurant",
    restaurantLocation: restaurant?.geolocation || { lat: 0, lng: 0 },
    deliveryAddress,
    items: normalizedItems,
    subtotal,
    deliveryFee,
    tax,
    total,
    status: "placed",
    statusHistory: [{ status: "placed", label: "Order placed" }],
    trackingCode: `CRV-${Date.now().toString().slice(-6)}`,
  };
};
