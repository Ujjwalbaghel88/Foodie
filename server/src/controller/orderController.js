import Order from "../model/orderModel.js";
import Restaurant from "../model/restaurantModel.js";

const statusFlow = [
  { status: "placed", label: "Order placed", thresholdMs: 0 },
  { status: "cooked", label: "Order cooked", thresholdMs: 15000 },
  { status: "rider_picked", label: "Delivery rider picked", thresholdMs: 35000 },
  { status: "delivered", label: "Delivered", thresholdMs: 65000 },
];

const getLiveStatus = (orderDoc) => {
  if (!orderDoc) {
    return {
      status: "placed",
      label: "Order placed",
      progress: 0,
    };
  }

  if (orderDoc.status === "delivered") {
    return { status: "delivered", label: "Delivered", progress: 100 };
  }

  const ageMs = Date.now() - new Date(orderDoc.createdAt).getTime();
  let current = statusFlow[0];

  for (const step of statusFlow) {
    if (ageMs >= step.thresholdMs) current = step;
  }

  const progressMap = {
    placed: 18,
    cooked: 42,
    rider_picked: 72,
    delivered: 100,
  };

  return {
    status: current.status,
    label: current.label,
    progress: progressMap[current.status] || 0,
  };
};

const buildStatusTimeline = (liveStatus) => {
  const order = ["placed", "cooked", "rider_picked", "delivered"];
  const labels = {
    placed: "Order placed",
    cooked: "Order cooked",
    rider_picked: "Delivery rider picked",
    delivered: "Delivered",
  };

  const activeIndex = order.indexOf(liveStatus);

  return order.map((status, index) => ({
    status,
    label: labels[status],
    completed: index <= activeIndex,
    active: index === activeIndex,
  }));
};

const serializeOrder = (orderDoc) => {
  const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
  const live = getLiveStatus(order);

  return {
    ...order,
    review: order.review || null,
    liveStatus: live.status,
    liveStatusLabel: live.label,
    statusProgress: live.progress,
    statusTimeline: buildStatusTimeline(live.status),
  };
};

export const createOrder = async (req, res, next) => {
  try {
    const customerId = req.user._id;
    const {
      restaurantId,
      restaurantName,
      restaurantImage,
      restaurantLocation,
      deliveryAddress,
      items,
      deliveryFee = 30,
    } = req.body;

    if (!restaurantId || !restaurantName) {
      const error = new Error("Restaurant information is required");
      error.status = 400;
      return next(error);
    }

    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error("Cart is empty");
      error.status = 400;
      return next(error);
    }

    if (!deliveryAddress?.address || !deliveryAddress?.geolocation) {
      const error = new Error("Delivery address is required");
      error.status = 400;
      return next(error);
    }

    const isBakeryCrav = restaurantId === "bakery-crav";
    const restaurant = isBakeryCrav ? null : await Restaurant.findById(restaurantId).select(
      "restaurantName images geolocation",
    );

    if (!restaurant && !isBakeryCrav) {
      const error = new Error("Restaurant not found");
      error.status = 404;
      return next(error);
    }

    const normalizedItems = items.map((item) => ({
      itemId: item.itemId || item._id || "",
      itemName: item.itemName || item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      foodType: item.foodType || "",
      image: item.image || "",
    }));

    const subtotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + Number(deliveryFee) + tax).toFixed(2));
    const trackingCode = `CRV-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
      customerId,
      ...(isBakeryCrav ? {} : { restaurantId }),
      restaurantName: isBakeryCrav ? "BakeryCrav" : restaurantName || restaurant.restaurantName,
      restaurantImage:
        restaurantImage ||
        restaurant?.images?.[0]?.URL ||
        "https://placehold.co/400x200?text=Restaurant",
      restaurantLocation:
        restaurantLocation || restaurant?.geolocation || { lat: 0, lng: 0 },
      deliveryAddress,
      items: normalizedItems,
      subtotal,
      deliveryFee: Number(deliveryFee),
      tax,
      total,
      status: "placed",
      statusHistory: [
        {
          status: "placed",
          label: "Order placed",
        },
      ],
      trackingCode,
    });

    res.status(201).json({
      message: "Order placed successfully",
      data: serializeOrder(order),
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrders = async (req, res, next) => {
  try {
    const customerId = req.user._id;
    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .populate("restaurantId", "restaurantName images geolocation address city cuisineType");

    res.status(200).json({
      message: "Orders retrieved successfully",
      data: orders.map(serializeOrder),
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrderById = async (req, res, next) => {
  try {
    const customerId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, customerId }).populate(
      "restaurantId",
      "restaurantName images geolocation address city cuisineType",
    );

    if (!order) {
      const error = new Error("Order not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      message: "Order retrieved successfully",
      data: serializeOrder(order),
    });
  } catch (error) {
    next(error);
  }
};

export const submitRestaurantReview = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { rating, sentiment = "Good", feedback = "" } = req.body || {};
    const customerId = req.user._id;

    const order = await Order.findOne({ _id: orderId, customerId });
    if (!order) {
      const error = new Error("Order not found");
      error.status = 404;
      return next(error);
    }

    if (getLiveStatus(order).status !== "delivered") {
      const error = new Error("You can only review a delivered order");
      error.status = 400;
      return next(error);
    }

    if (order.review?.submittedAt) {
      return res.status(200).json({
        message: "Review already submitted for this order",
        data: serializeOrder(order),
      });
    }

    const allowedSentiments = ["Good", "Bad", "Excellent"];
    const validRating = Number(rating);
    const normalizedRating = Number.isFinite(validRating) ? Math.min(5, Math.max(1, validRating)) : 4;
    const normalizedSentiment = allowedSentiments.includes(sentiment) ? sentiment : "Good";

    const reviewPayload = {
      rating: normalizedRating,
      sentiment: normalizedSentiment,
      feedback: String(feedback || "").trim(),
      submittedAt: new Date(),
    };

    if (order.restaurantId) {
      const restaurant = await Restaurant.findById(order.restaurantId);
      if (restaurant) {
        const previousTotal = Number(restaurant.rating || 0) * Number(restaurant.numReviews || 0);
        const newReviewCount = Number(restaurant.numReviews || 0) + 1;
        const nextRating = (previousTotal + normalizedRating) / newReviewCount;

        restaurant.rating = Number(nextRating.toFixed(2));
        restaurant.numReviews = newReviewCount;
        await restaurant.save();
      }
    }

    order.review = reviewPayload;
    await order.save();

    res.status(200).json({
      message: "Thank you for your feedback",
      data: serializeOrder(order),
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ userId: req.user._id }).select("_id restaurantName");
    if (!restaurant) return res.status(404).json({ message: "Restaurant profile not found" });

    const orders = await Order.find({ restaurantId: restaurant._id })
      .sort({ createdAt: -1 })
      .populate("customerId", "fullName email phone");

    res.status(200).json({ message: "Restaurant orders retrieved", data: orders.map(serializeOrder) });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const allowedStatuses = ["placed", "cooked", "rider_picked", "delivered"];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid order status" });

    const restaurant = await Restaurant.findOne({ userId: req.user._id }).select("_id");
    const order = await Order.findOne({ _id: req.params.orderId, restaurantId: restaurant?._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const labels = { placed: "Order placed", cooked: "Order cooked", rider_picked: "Delivery rider picked", delivered: "Delivered" };
    order.status = status;
    order.statusHistory.push({ status, label: labels[status] });
    await order.save();

    res.status(200).json({ message: "Order status updated", data: serializeOrder(order) });
  } catch (error) {
    next(error);
  }
};
