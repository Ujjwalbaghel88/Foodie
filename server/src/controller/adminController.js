import User from "../model/userModel.js";
import Restaurant from "../model/restaurantModel.js";
import MenuItem from "../model/menuModel.js";
import Customer from "../model/customerModel.js";
import Rider from "../model/riderModel.js";
import {
  getLegacyCollections,
  seedLegacyJsonCollections,
} from "../utils/legacyJsonData.js";

export const getManagerProgress = async (req, res, next) => {
  try {
    const managers = await User.find({ userType: "restaurant" })
      .select("fullName email phone photo createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const restaurants = await Restaurant.find({
      userId: { $in: managers.map((manager) => manager._id) },
    }).select("userId restaurantName isProfileComplete isActive").lean();
    const restaurantsByUserId = new Map(restaurants.map((restaurant) => [
      restaurant.userId.toString(), restaurant,
    ]));
    const menus = await MenuItem.find({
      restaurantId: { $in: restaurants.map((restaurant) => restaurant._id) },
    }).select("restaurantId items").lean();
    const itemCounts = new Map(menus.map((menu) => [
      menu.restaurantId.toString(), menu.items.length,
    ]));

    const data = managers.map((manager) => {
      const restaurant = restaurantsByUserId.get(manager._id.toString());
      const menuItemCount = restaurant ? itemCounts.get(restaurant._id.toString()) || 0 : 0;
      const profileComplete = Boolean(restaurant?.isProfileComplete);
      return {
        id: manager._id,
        fullName: manager.fullName,
        email: manager.email,
        photo: manager.photo,
        restaurantName: restaurant?.restaurantName || "Restaurant profile pending",
        profileComplete,
        menuItemCount,
        isActive: Boolean(restaurant?.isActive),
        progress: (profileComplete ? 50 : 0) + (menuItemCount ? 50 : 0),
      };
    });

    res.status(200).json({ message: "Manager progress retrieved", data });
  } catch (error) {
    next(error);
  }
};

export const seedLegacyJsonData = async (req, res, next) => {
  try {
    const replace = Boolean(req.body?.replace);
    const result = await seedLegacyJsonCollections({ replace });

    res.status(200).json({
      message: replace
        ? "Legacy JSON data replaced successfully"
        : "Legacy JSON data imported successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const collectionDeleteMap = {
  users: () => User.deleteMany({}),
  restaurants: () => Restaurant.deleteMany({}),
  menuitems: () => MenuItem.deleteMany({}),
  customers: () => Customer.deleteMany({}),
  riders: () => Rider.deleteMany({}),
};

export const resetDataCollection = async (req, res, next) => {
  try {
    const { collection } = req.params;
    if (!collectionDeleteMap[collection]) {
      return res.status(400).json({ message: "Invalid collection name" });
    }

    await collectionDeleteMap[collection]();
    const result = await seedLegacyJsonCollections();

    res.status(200).json({
      message: `${collection} reset successfully from legacy JSON`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getFallbackIfEmpty = async (collection, legacyCollection) => {
  if (collection.length > 0) return collection;
  return legacyCollection || [];
};

export const getDataCollections = async (req, res, next) => {
  try {
    const [legacyData, users, restaurants, menus, customers, riders] = await Promise.all([
      getLegacyCollections(),
      User.find().select("fullName email phone userType photo createdAt updatedAt").sort({ createdAt: -1 }).lean(),
      Restaurant.find().select("restaurantName address city state cuisineType images rating numReviews isActive isProfileComplete userId createdAt updatedAt").sort({ createdAt: -1 }).lean(),
      MenuItem.find().select("restaurantId items createdAt updatedAt").populate("restaurantId", "restaurantName city").sort({ createdAt: -1 }).lean(),
      Customer.find().select("userId addressBook isProfileComplete isActive createdAt updatedAt").populate("userId", "fullName email").sort({ createdAt: -1 }).lean(),
      Rider.find().select("userId vehicleDetails currentLocation isAvailable ratings isProfileComplete isActive createdAt updatedAt").populate("userId", "fullName email").sort({ createdAt: -1 }).lean(),
    ]);

    const data = {
      users: await getFallbackIfEmpty(users, legacyData.users),
      restaurants: await getFallbackIfEmpty(restaurants, legacyData.restaurants),
      menuitems: await getFallbackIfEmpty(menus, legacyData.menuitems),
      customers: await getFallbackIfEmpty(customers, legacyData.customers),
      riders: await getFallbackIfEmpty(riders, legacyData.riders),
    };

    res.status(200).json({
      message: "Data collections retrieved successfully",
      data,
      counts: {
        users: data.users.length,
        restaurants: data.restaurants.length,
        menuitems: data.menuitems.length,
        customers: data.customers.length,
        riders: data.riders.length,
      },
      source: {
        users: users.length > 0 ? "database" : "legacy-json",
        restaurants: restaurants.length > 0 ? "database" : "legacy-json",
        menuitems: menus.length > 0 ? "database" : "legacy-json",
        customers: customers.length > 0 ? "database" : "legacy-json",
        riders: riders.length > 0 ? "database" : "legacy-json",
      },
    });
  } catch (error) {
    next(error);
  }
};
