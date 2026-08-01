import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
    },
    itemName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    foodType: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    ReceiverName: { type: String, required: true },
    ReceiverPhone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    geolocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { _id: false },
);

const orderStatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["placed", "cooked", "rider_picked", "delivered"],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: false,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    restaurantImage: {
      type: String,
      default: "",
    },
    restaurantLocation: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    deliveryAddress: {
      type: addressSnapshotSchema,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 30,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["placed", "cooked", "rider_picked", "delivered"],
      default: "placed",
    },
    statusHistory: {
      type: [orderStatusHistorySchema],
      default: [],
    },
    trackingCode: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
