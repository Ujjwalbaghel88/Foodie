import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import User from "../model/userModel.js";
import Restaurant from "../model/restaurantModel.js";
import MenuItem from "../model/menuModel.js";
import Customer from "../model/customerModel.js";
import Rider from "../model/riderModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../../");

const JSON_FILES = {
  users: path.join(ROOT_DIR, "cravingsDB.users.json"),
  restaurants: path.join(ROOT_DIR, "cravingsDB.restaurants.json"),
  menuitems: path.join(ROOT_DIR, "cravingsDB.menuitems.json"),
  customers: path.join(ROOT_DIR, "cravingsDB.customers.json"),
  riders: path.join(ROOT_DIR, "cravingsDB.riders.json"),
};

const legacyCache = {
  loaded: false,
  data: null,
};

const asObjectId = (value) => new mongoose.Types.ObjectId(String(value));

const normalizeLegacyValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeLegacyValue);
  }

  if (value && typeof value === "object") {
    if (Object.keys(value).length === 1) {
      if (value.$oid) return asObjectId(value.$oid);
      if (value.$date) return new Date(value.$date);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeLegacyValue(nestedValue)]),
    );
  }

  return value;
};

const readJsonFile = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  return normalizeLegacyValue(JSON.parse(raw));
};

export const loadLegacyData = async () => {
  if (legacyCache.loaded && legacyCache.data) {
    return legacyCache.data;
  }

  const [users, restaurants, menuitems, customers, riders] = await Promise.all([
    readJsonFile(JSON_FILES.users),
    readJsonFile(JSON_FILES.restaurants),
    readJsonFile(JSON_FILES.menuitems),
    readJsonFile(JSON_FILES.customers),
    readJsonFile(JSON_FILES.riders),
  ]);

  legacyCache.loaded = true;
  legacyCache.data = { users, restaurants, menuitems, customers, riders };
  return legacyCache.data;
};

const seedUsers = async (users = []) => {
  if (!users.length) return { upsertedCount: 0 };

  return User.bulkWrite(
    users.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            fullName: user.fullName,
            email: user.email,
            password: user.password,
            phone: user.phone,
            userType: user.userType,
            photo: user.photo || {
              url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=random&size=512`,
              publicId: null,
            },
            passwordResetOtpHash: user.passwordResetOtpHash ?? null,
            passwordResetOtpExpiresAt: user.passwordResetOtpExpiresAt ?? null,
          },
          $setOnInsert: { _id: user._id },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
};

const seedRestaurants = async (restaurants = []) => {
  if (!restaurants.length) return { upsertedCount: 0 };

  return Restaurant.bulkWrite(
    restaurants.map((restaurant) => ({
      updateOne: {
        filter: { _id: restaurant._id },
        update: {
          $set: {
            userId: restaurant.userId,
            restaurantName: restaurant.restaurantName,
            address: restaurant.address,
            city: restaurant.city,
            state: restaurant.state,
            zipCode: restaurant.zipCode,
            country: restaurant.country,
            geolocation: restaurant.geolocation,
            cuisineType: restaurant.cuisineType,
            images: restaurant.images || [],
            openingHours: restaurant.openingHours,
            closingHours: restaurant.closingHours,
            licence: restaurant.licence || {},
            bankingDetails: restaurant.bankingDetails || {},
            isProfileComplete: restaurant.isProfileComplete ?? true,
            isActive: restaurant.isActive ?? true,
            rating: restaurant.rating ?? 0,
            numReviews: restaurant.numReviews ?? 0,
            description: restaurant.description || "",
          },
          $setOnInsert: { _id: restaurant._id },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
};

const seedMenuItems = async (menus = []) => {
  if (!menus.length) return { upsertedCount: 0 };

  return MenuItem.bulkWrite(
    menus.map((menu) => ({
      updateOne: {
        filter: { _id: menu._id },
        update: {
          $set: {
            restaurantId: menu.restaurantId,
            items: (menu.items || []).map((item) => ({
              ...item,
              image: item.image || { url: "", publicId: "" },
            })),
          },
          $setOnInsert: { _id: menu._id },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
};

const seedCustomers = async (customers = []) => {
  if (!customers.length) return { upsertedCount: 0 };

  return Customer.bulkWrite(
    customers.map((customer) => ({
      updateOne: {
        filter: { _id: customer._id },
        update: {
          $set: {
            userId: customer.userId,
            addressBook: customer.addressBook || [],
            isProfileComplete: customer.isProfileComplete ?? false,
            isActive: customer.isActive ?? true,
          },
          $setOnInsert: { _id: customer._id },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
};

const seedRiders = async (riders = []) => {
  if (!riders.length) return { upsertedCount: 0 };

  return Rider.bulkWrite(
    riders.map((rider) => ({
      updateOne: {
        filter: { _id: rider._id },
        update: {
          $set: {
            userId: rider.userId,
            vehicleDetails: rider.vehicleDetails || {},
            isAvailable: rider.isAvailable ?? true,
            currentLocation: rider.currentLocation || {},
            ratings: rider.ratings || [],
            isProfileComplete: rider.isProfileComplete ?? false,
            isActive: rider.isActive ?? true,
          },
          $setOnInsert: { _id: rider._id },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
};

export const seedLegacyJsonCollections = async ({ replace = false } = {}) => {
  const { users, restaurants, menuitems, customers, riders } = await loadLegacyData();

  if (replace) {
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      MenuItem.deleteMany({}),
      Customer.deleteMany({}),
      Rider.deleteMany({}),
    ]);
  }

  const [userResult, restaurantResult, menuResult, customerResult, riderResult] = await Promise.all([
    seedUsers(users),
    seedRestaurants(restaurants),
    seedMenuItems(menuitems),
    seedCustomers(customers),
    seedRiders(riders),
  ]);

  return {
    users: userResult?.upsertedCount || 0,
    restaurants: restaurantResult?.upsertedCount || 0,
    menuitems: menuResult?.upsertedCount || 0,
    customers: customerResult?.upsertedCount || 0,
    riders: riderResult?.upsertedCount || 0,
  };
};

export const getLegacyRestaurants = async () => {
  const { restaurants } = await loadLegacyData();
  return restaurants;
};

export const getLegacyRestaurantById = async (restaurantId) => {
  const restaurants = await getLegacyRestaurants();
  return restaurants.find((restaurant) => restaurant._id?.toString() === restaurantId?.toString()) || null;
};

export const getLegacyMenuByRestaurantId = async (restaurantId) => {
  const { menuitems } = await loadLegacyData();
  return menuitems.find((menu) => menu.restaurantId?.toString() === restaurantId?.toString()) || null;
};

export const getLegacyCollections = loadLegacyData;
