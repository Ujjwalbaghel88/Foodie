import User from "../model/userModel.js";
import Restaurant from "../model/restaurantModel.js";
import MenuItem from "../model/menuModel.js";
import Customer from "../model/customerModel.js";
import Rider from "../model/riderModel.js";
import Order from "../model/orderModel.js";
import bcrypt from "bcrypt";
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
        restaurantId: restaurant?._id || null,
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

export const resetRestaurantManagerPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body || {};

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const manager = await User.findOne({ _id: id, userType: "restaurant" });
    if (!manager) return res.status(404).json({ message: "Restaurant manager not found" });

    manager.password = await bcrypt.hash(newPassword, 10);
    await manager.save();

    res.status(200).json({ message: "Restaurant manager password reset successfully" });
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

export const getReports = async (req, res, next) => {
  try {
    const months = Math.min(Math.max(Number(req.query.months) || 6, 3), 12);
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    startDate.setMonth(startDate.getMonth() - (months - 1));

    const [report, counts] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $facet: {
            totals: [
              { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 }, averageOrder: { $avg: "$total" } } },
            ],
            monthly: [
              { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
              { $sort: { "_id.year": 1, "_id.month": 1 } },
            ],
            statuses: [
              { $group: { _id: "$status", orders: { $sum: 1 } } },
              { $sort: { orders: -1 } },
            ],
            topRestaurants: [
              { $group: { _id: "$restaurantName", revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
              { $sort: { revenue: -1 } },
              { $limit: 5 },
            ],
          },
        },
      ]),
      Promise.all([
        User.countDocuments({ userType: "customer" }),
        Restaurant.countDocuments({ isActive: true }),
        Rider.countDocuments({ isActive: true }),
      ]),
    ]);

    res.status(200).json({
      message: "Reports retrieved successfully",
      data: {
        months,
        startDate,
        totals: report[0]?.totals[0] || { revenue: 0, orders: 0, averageOrder: 0 },
        monthly: report[0]?.monthly || [],
        statuses: report[0]?.statuses || [],
        topRestaurants: report[0]?.topRestaurants || [],
        platform: { customers: counts[0], activeRestaurants: counts[1], activeRiders: counts[2] },
      },
    });
  } catch (error) {
    next(error);
  }
};
