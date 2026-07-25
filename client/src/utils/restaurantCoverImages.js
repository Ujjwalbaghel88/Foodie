const DEFAULT_FALLBACK_IMAGE = "https://placehold.co/900x600?text=Restaurant";

const normalizeName = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const COVER_IMAGE_OVERRIDES = [
  {
    patterns: ["manohar", "manohar dairy", "manohar dairy and restaurant"],
    image:
      "https://media-cdn.tripadvisor.com/media/photo-s/0e/59/00/68/restaurant.jpg",
  },
  {
    patterns: ["spice kitchen", "meeras spice kitchen", "meera spice kitchen"],
    image:
      "https://i.etsystatic.com/8263132/r/il/1b5060/5310621698/il_794xN.5310621698_ellr.jpg",
  },
];

export const getRestaurantCoverImage = (
  restaurantName,
  fallbackImage = DEFAULT_FALLBACK_IMAGE,
) => {
  const normalizedName = normalizeName(restaurantName);
  const override = COVER_IMAGE_OVERRIDES.find(({ patterns }) =>
    patterns.some((pattern) => normalizedName.includes(normalizeName(pattern))),
  );

  return override?.image || fallbackImage || DEFAULT_FALLBACK_IMAGE;
};

