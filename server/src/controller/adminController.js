import User from "../model/userModel.js";
import Restaurant from "../model/restaurantModel.js";
import MenuItem from "../model/menuModel.js";

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
