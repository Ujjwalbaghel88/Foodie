import crypto from "node:crypto";
import Order from "../model/orderModel.js";
import Restaurant from "../model/restaurantModel.js";

const getRazorpayAuth = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay keys are not configured on the server");
    error.status = 503;
    throw error;
  }

  return Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");
};

const assertRazorpayConfiguration = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(
      new Error("Razorpay keys are not configured on the server"),
      { status: 503 },
    );
  }
};

const buildOrderData = async (customerId, payload) => {
  const {
    restaurantId,
    restaurantName,
    restaurantImage,
    restaurantLocation,
    deliveryAddress,
    items,
    deliveryFee = 30,
  } = payload;

  if (!restaurantId || !restaurantName) throw Object.assign(new Error("Restaurant information is required"), { status: 400 });
  if (!Array.isArray(items) || items.length === 0) throw Object.assign(new Error("Cart is empty"), { status: 400 });
  if (!deliveryAddress?.address || !deliveryAddress?.geolocation) throw Object.assign(new Error("Delivery address is required"), { status: 400 });

  const isBakeryCrav = restaurantId === "bakery-crav";
  const restaurant = isBakeryCrav
    ? null
    : await Restaurant.findById(restaurantId).select("restaurantName images geolocation");
  if (!restaurant && !isBakeryCrav) throw Object.assign(new Error("Restaurant not found"), { status: 404 });

  const normalizedItems = items.map((item) => ({
    itemId: item.itemId || item._id || "",
    itemName: item.itemName || item.name,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    foodType: item.foodType || "",
    image: item.image || "",
  }));
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const safeDeliveryFee = Number(deliveryFee);
  const total = Number((subtotal + safeDeliveryFee + tax).toFixed(2));

  return {
    customerId,
    ...(isBakeryCrav ? {} : { restaurantId }),
    restaurantName: isBakeryCrav ? "BakeryCrav" : restaurantName || restaurant.restaurantName,
    restaurantImage: restaurantImage || restaurant?.images?.[0]?.URL || "https://placehold.co/400x200?text=Restaurant",
    restaurantLocation: restaurantLocation || restaurant?.geolocation || { lat: 0, lng: 0 },
    deliveryAddress,
    items: normalizedItems,
    subtotal,
    deliveryFee: safeDeliveryFee,
    tax,
    total,
    status: "placed",
    statusHistory: [{ status: "placed", label: "Order placed" }],
    trackingCode: `CRV-${Date.now().toString().slice(-6)}`,
  };
};

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const orderData = await buildOrderData(req.user._id, req.body);
    const demoMode = process.env.NODE_ENV !== "production" &&
      process.env.RAZORPAY_DEMO_MODE === "true";
    if (demoMode) {
      return res.status(200).json({
        demoMode: true,
        keyId: "rzp_test_demo",
        razorpayOrderId: `demo_order_${Date.now()}`,
        amount: Math.round(orderData.total * 100),
        currency: "INR",
      });
    }
    const auth = getRazorpayAuth();
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(orderData.total * 100), currency: "INR", receipt: orderData.trackingCode }),
    });
    const razorpayOrder = await response.json();
    if (!response.ok) throw Object.assign(new Error(razorpayOrder.error?.description || "Could not create Razorpay order"), { status: 502 });

    res.status(200).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderPayload } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderPayload) {
      return res.status(400).json({ message: "Incomplete Razorpay payment details" });
    }

    const demoMode = process.env.NODE_ENV !== "production" &&
      process.env.RAZORPAY_DEMO_MODE === "true";
    if (!demoMode) {
      assertRazorpayConfiguration();
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expectedSignature !== razorpay_signature) return res.status(400).json({ message: "Payment verification failed" });
    }

    const orderData = await buildOrderData(req.user._id, orderPayload);
    const order = await Order.create({
      ...orderData,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });
    res.status(201).json({ message: "Payment successful and order placed", data: order });
  } catch (error) {
    next(error);
  }
};
