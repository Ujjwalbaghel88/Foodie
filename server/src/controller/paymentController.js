import crypto from "node:crypto";
import Order from "../model/orderModel.js";
import { buildOrderData } from "../utils/buildOrderData.js";

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
      const expected = Buffer.from(expectedSignature, "hex");
      const received = Buffer.from(razorpay_signature, "hex");
      if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    }

    const orderData = await buildOrderData(req.user._id, orderPayload);
    if (!demoMode) {
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, {
        headers: { Authorization: `Basic ${getRazorpayAuth()}` },
      });
      const payment = await paymentResponse.json();
      const expectedAmount = Math.round(orderData.total * 100);
      if (!paymentResponse.ok || payment.order_id !== razorpay_order_id || payment.amount !== expectedAmount || payment.status !== "captured") {
        return res.status(400).json({ message: "Payment amount or status could not be verified" });
      }
    }
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
