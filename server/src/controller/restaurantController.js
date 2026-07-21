import Restaurant from "../model/restaurantModel.js";
import {
  uploadMultipleImages,
  deleteMultipleImages,
} from "../utils/imageUploader.js";

export const createRestaurant = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let restaurantData = req.body;
    const files = req.files;

    // Parse nested JSON strings if they exist (from FormData submission)
    if (typeof restaurantData.geolocation === "string") {
      try {
        restaurantData.geolocation = JSON.parse(restaurantData.geolocation);
      } catch (parseError) {
        console.error("Error parsing geolocation:", parseError);
        const error = new Error("Invalid geolocation format");
        error.status = 400;
        return next(error);
      }
    }

    // Ensure geolocation has proper lat/lng values as numbers
    if (restaurantData.geolocation) {
      restaurantData.geolocation = {
        lat: parseFloat(restaurantData.geolocation.lat),
        lng: parseFloat(restaurantData.geolocation.lng),
      };
    }

    if (typeof restaurantData.licence === "string") {
      restaurantData.licence = JSON.parse(restaurantData.licence);
    }
    if (typeof restaurantData.bankingDetails === "string") {
      restaurantData.bankingDetails = JSON.parse(restaurantData.bankingDetails);
    }

    // Check if restaurant already exists for this user
    const existingRestaurant = await Restaurant.findOne({ userId });
    if (existingRestaurant) {
      const error = new Error(
        "Restaurant profile already exists for this user",
      );
      error.status = 400;
      return next(error);
    }

    // Handle bulk image upload
    let uploadedImages = [];
    if (files && files.length > 0) {
      const cloudinaryFolder = `restaurants/${userId}`;
      const imageBuffers = files.map((file) => file.buffer);
      const base64Images = imageBuffers.map((buffer) =>
        buffer.toString("base64"),
      );

      uploadedImages = await uploadMultipleImages(
        base64Images,
        cloudinaryFolder,
      );
    }

    // Create new restaurant with uploaded images
    const newRestaurant = new Restaurant({
      userId,
      ...restaurantData,
      images: uploadedImages,
      isProfileComplete: true,
    });

    await newRestaurant.save();
    res.status(201).json({
      message: "Restaurant profile created successfully",
      data: newRestaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantByUserId = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      const error = new Error("Restaurant not found for this user");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      message: "Restaurant data retrieved successfully",
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let updates = req.body;
    const files = req.files;

    // Parse nested JSON strings if they exist (from FormData submission)
    if (typeof updates.geolocation === "string") {
      try {
        updates.geolocation = JSON.parse(updates.geolocation);
      } catch (parseError) {
        console.error("Error parsing geolocation:", parseError);
        const error = new Error("Invalid geolocation format");
        error.status = 400;
        return next(error);
      }
    }

    // Ensure geolocation has proper lat/lng values as numbers
    if (updates.geolocation) {
      updates.geolocation = {
        lat: parseFloat(updates.geolocation.lat),
        lng: parseFloat(updates.geolocation.lng),
      };
    }

    if (typeof updates.licence === "string") {
      updates.licence = JSON.parse(updates.licence);
    }
    if (typeof updates.bankingDetails === "string") {
      updates.bankingDetails = JSON.parse(updates.bankingDetails);
    }

    // Get existing restaurant
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      const error = new Error("Restaurant not found for this user");
      error.status = 404;
      return next(error);
    }

    // Handle image updates: delete old images and upload new ones
    if (files && files.length > 0) {
      // Delete all previous images from Cloudinary
      if (restaurant.images && restaurant.images.length > 0) {
        const publicIds = restaurant.images.map((img) => img.publicId);
        try {
          await deleteMultipleImages(publicIds);
        } catch (deleteError) {
          console.error("Error deleting previous images:", deleteError);
          // Continue with update even if deletion fails
        }
      }

      // Upload new images
      const cloudinaryFolder = `restaurants/${userId}`;
      const imageBuffers = files.map((file) => file.buffer);
      const base64Images = imageBuffers.map((buffer) =>
        buffer.toString("base64"),
      );

      const uploadedImages = await uploadMultipleImages(
        base64Images,
        cloudinaryFolder,
      );
      updates.images = uploadedImages;
    }

    // Update restaurant
    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { userId },
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    res.status(200).json({
      message: "Restaurant updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Public endpoints - No authentication required
export const getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find()
      .select(
        "restaurantName address city state cuisineType images openingHours closingHours geolocation rating numReviews description",
      )
      .populate("userId", "email contactNumber");

    res.status(200).json({
      message: "All restaurants retrieved successfully",
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId).populate(
      "userId",
      "email contactNumber fullName",
    );

    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      message: "Restaurant retrieved successfully",
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};
