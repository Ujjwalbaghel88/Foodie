const FAVORITE_RESTAURANTS_KEY = "cravings_favorite_restaurants";

export const readFavoriteRestaurantIds = () => {
  try {
    const raw = localStorage.getItem(FAVORITE_RESTAURANTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read favorite restaurants:", error);
    return [];
  }
};

export const writeFavoriteRestaurantIds = (restaurantIds = []) => {
  try {
    localStorage.setItem(
      FAVORITE_RESTAURANTS_KEY,
      JSON.stringify([...new Set(restaurantIds)]),
    );
  } catch (error) {
    console.error("Could not save favorite restaurants:", error);
  }
};

export const toggleFavoriteRestaurantId = (restaurantId) => {
  const currentIds = readFavoriteRestaurantIds();
  const nextIds = currentIds.includes(restaurantId)
    ? currentIds.filter((id) => id !== restaurantId)
    : [...currentIds, restaurantId];

  writeFavoriteRestaurantIds(nextIds);
  return nextIds;
};

