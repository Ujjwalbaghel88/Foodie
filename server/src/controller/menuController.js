import MenuItem from "../model/menuModel.js";
import Restaurant from "../model/restaurantModel.js";
import { uploadSingleImage, deleteImage } from "../utils/imageUploader.js";

export const addMenuItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemName, description, price, foodType } = req.body;
    const file = req.file;

    // Validation
    if (!itemName || !description || !price || !foodType) {
      const error = new Error("Please provide all required fields");
      error.status = 400;
      return next(error);
    }

    // Get restaurant by userId
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      const error = new Error("Restaurant not found for this user");
      error.status = 404;
      return next(error);
    }

    // Get or create menu
    let menu = await MenuItem.findOne({ restaurantId: restaurant._id });
    if (!menu) {
      menu = new MenuItem({
        restaurantId: restaurant._id,
        items: [],
      });
    }

    // Handle image upload if provided
    let imageData = { url: "", publicId: "" };
    if (file) {
      try {
        const cloudinaryFolder = `menus/${restaurant._id}`;
        const base64Image = file.buffer.toString("base64");
        const uploadedImage = await uploadSingleImage(base64Image, cloudinaryFolder);
        
        imageData = {
          url: uploadedImage.URL,
          publicId: uploadedImage.publicId,
        };
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        // Continue without image if upload fails
      }
    }

    // Add new item to menu
    const newItem = {
      itemName,
      description,
      price: parseFloat(price),
      foodType,
      image: imageData,
      isAvailable: true,
      isDiscontinued: false,
      ratings: [],
    };

    menu.items.push(newItem);
    await menu.save();

    res.status(201).json({
      message: "Menu item added successfully",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItems = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get restaurant by userId
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      const error = new Error("Restaurant not found for this user");
      error.status = 404;
      return next(error);
    }

    // Get menu
    const menu = await MenuItem.findOne({ restaurantId: restaurant._id }).populate(
      "items.ratings.customerId",
      "fullName email"
    );

    if (!menu) {
      return res.status(200).json({
        message: "No menu found for this restaurant",
        data: { restaurantId: restaurant._id, items: [] },
      });
    }

    res.status(200).json({
      message: "Menu items retrieved successfully",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemsByRestaurantId = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const menu = await MenuItem.findOne({ restaurantId }).populate(
      "items.ratings.customerId",
      "fullName email"
    );

    if (!menu) {
      return res.status(200).json({
        message: "No menu found for this restaurant",
        data: { restaurantId, items: [] },
      });
    }

    res.status(200).json({
      message: "Menu items retrieved successfully",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { itemName, description, price, foodType } = req.body;
    const file = req.file;

    // Get restaurant by userId
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      const error = new Error("Restaurant not found for this user");
      error.status = 404;
      return next(error);
    }

    // Get menu
    const menu = await MenuItem.findOne({ restaurantId: restaurant._id });
    if (!menu) {
      const error = new Error("Menu not found");
      error.status = 404;
      return next(error);
    }

    // Find item index
    const itemIndex = menu.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      const error = new Error("Menu item not found");
      error.status = 404;
      return next(error);
    }

    // Update basic fields
    if (itemName) menu.items[itemIndex].itemName = itemName;
    if (description) menu.items[itemIndex].description = description;
    if (price) menu.items[itemIndex].price = parseFloat(price);
    if (foodType) menu.items[itemIndex].foodType = foodType;

    // Handle image update if provided
    if (file) {
      try {
        // Delete old image if exists
        if (menu.items[itemIndex].image?.publicId) {
          try {
            await deleteImage(menu.items[itemIndex].image.publicId);
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }

        // Upload new image
        const cloudinaryFolder = `menus/${restaurant._id}`;
        const base64Image = file.buffer.toString("base64");
        const uploadedImage = await uploadSingleImage(base64Image, cloudinaryFolder);

        menu.items[itemIndex].image = {
          url: uploadedImage.URL,
          publicId: uploadedImage.publicId,
        };
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        // Continue without image update if upload fails
      }
    }

    await menu.save();

    res.status(200).json({
      message: "Menu item updated successfully",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const markItemUnavailable = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { isAvailable } = req.body;

    // Get restaurant by userId
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      const error = new Error("Restaurant not found for this user");
      error.status = 404;
      return next(error);
    }

    // Get menu
    const menu = await MenuItem.findOne({ restaurantId: restaurant._id });
    if (!menu) {
      const error = new Error("Menu not found");
      error.status = 404;
      return next(error);
    }

    // Find item and update
    const item = menu.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      const error = new Error("Menu item not found");
      error.status = 404;
      return next(error);
    }

    item.isAvailable = isAvailable;
    await menu.save();

    res.status(200).json({
      message: `Menu item marked ${isAvailable ? "available" : "unavailable"}`,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const markItemDiscontinued = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { isDiscontinued } = req.body;

    // Get restaurant by userId
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      const error = new Error("Restaurant not found for this user");
      error.status = 404;
      return next(error);
    }

    // Get menu
    const menu = await MenuItem.findOne({ restaurantId: restaurant._id });
    if (!menu) {
      const error = new Error("Menu not found");
      error.status = 404;
      return next(error);
    }

    // Find item and update
    const item = menu.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      const error = new Error("Menu item not found");
      error.status = 404;
      return next(error);
    }

    item.isDiscontinued = isDiscontinued;
    await menu.save();

    res.status(200).json({
      message: `Menu item marked ${isDiscontinued ? "discontinued" : "active"}`,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    // Get restaurant by userId
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      const error = new Error("Restaurant not found for this user");
      error.status = 404;
      return next(error);
    }

    // Get menu
    const menu = await MenuItem.findOne({ restaurantId: restaurant._id });
    if (!menu) {
      const error = new Error("Menu not found");
      error.status = 404;
      return next(error);
    }

    // Find item index
    const itemIndex = menu.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      const error = new Error("Menu item not found");
      error.status = 404;
      return next(error);
    }

    // Delete image from Cloudinary if exists
    const item = menu.items[itemIndex];
    if (item.image?.publicId) {
      try {
        await deleteImage(item.image.publicId);
      } catch (deleteError) {
        console.error("Error deleting image:", deleteError);
      }
    }

    // Remove item from array
    menu.items.splice(itemIndex, 1);
    await menu.save();

    res.status(200).json({
      message: "Menu item deleted successfully",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};
