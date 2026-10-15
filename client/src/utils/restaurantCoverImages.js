const DEFAULT_FALLBACK_IMAGE = "/aboutPage.png";

const normalizeName = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const COVER_IMAGE_OVERRIDES = [
  {
    patterns: ["sagar gaire", "sagar gaire fast food"],
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
  },
  {
    patterns: ["sharma", "sharma and vishnu", "sharma vishnu"],
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=85",
  },
  {
    patterns: ["zam zam", "zam zam fast food"],
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85",
  },
  {
    patterns: ["manohar", "manohar dairy", "manohar dairy and restaurant"],
    image:
      "https://static.wixstatic.com/media/d1e9aa_bd5ae27422204be7a53acc64c34a0e75~mv2.png/v1/fill/w_195%2Ch_147%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/ManoharDairy_NewLogo_Final_CC%20%281%29.png",
  },
  {
    patterns: ["burger king"],
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Burger_King_2020.svg",
  },
  {
    patterns: ["spice kitchen", "meeras spice kitchen", "meera spice kitchen"],
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=85",
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
