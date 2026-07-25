const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getRestaurantId = (order) =>
  order?.restaurantId?._id || order?.restaurantId || order?.restaurantName || "";

export const buildCustomerInsights = (orders = []) => {
  const restaurantCounts = new Map();
  const cuisineCounts = new Map();
  const itemCounts = new Map();
  const itemMap = new Map();

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const recentOrder = orders[0] || null;

  orders.forEach((order) => {
    const restaurantName = order.restaurantName || "Unknown restaurant";
    const restaurantId = getRestaurantId(order);
    const restaurantImage = order.restaurantImage || "";
    const orderDate = order.createdAt ? new Date(order.createdAt) : null;

    restaurantCounts.set(
      restaurantName,
      (restaurantCounts.get(restaurantName) || 0) + 1,
    );

    toArray(order.restaurantId?.cuisineType).forEach((cuisine) => {
      const key = cuisine.toLowerCase();
      cuisineCounts.set(key, (cuisineCounts.get(key) || 0) + 1);
    });

    (order.items || []).forEach((item) => {
      const itemName = item.itemName || item.name || "Item";
      const itemKey = `${restaurantId}::${item.itemId || itemName}`;
      const quantity = Number(item.quantity || 0);
      const itemTotal = Number(item.price || 0) * quantity;

      itemCounts.set(itemName, (itemCounts.get(itemName) || 0) + quantity);

      const existing = itemMap.get(itemKey);
      if (existing) {
        existing.quantity += quantity;
        existing.totalSpent += itemTotal;
        if (!existing.latestOrderDate || (orderDate && orderDate > existing.latestOrderDate)) {
          existing.latestOrderDate = orderDate;
          existing.sourceOrder = order;
        }
        return;
      }

      itemMap.set(itemKey, {
        itemName,
        itemId: item.itemId || item._id || "",
        quantity,
        totalSpent: itemTotal,
        restaurantName,
        restaurantImage,
        sourceOrder: order,
        latestOrderDate: orderDate,
      });
    });
  });

  const favoriteRestaurantEntry = [...restaurantCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const favoriteCuisineEntry = [...cuisineCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const favoriteItemEntry = [...itemCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const mostOrderedItems = [...itemMap.values()]
    .sort((a, b) => {
      if (b.quantity !== a.quantity) return b.quantity - a.quantity;
      return (b.latestOrderDate?.getTime?.() || 0) - (a.latestOrderDate?.getTime?.() || 0);
    })
    .slice(0, 3);

  return {
    totalOrders,
    totalSpent,
    averageOrderValue,
    recentOrder,
    favoriteRestaurant: favoriteRestaurantEntry
      ? { name: favoriteRestaurantEntry[0], count: favoriteRestaurantEntry[1] }
      : null,
    favoriteCuisine: favoriteCuisineEntry
      ? { name: favoriteCuisineEntry[0], count: favoriteCuisineEntry[1] }
      : null,
    favoriteItem: favoriteItemEntry
      ? { name: favoriteItemEntry[0], count: favoriteItemEntry[1] }
      : null,
    mostOrderedItems,
  };
};

