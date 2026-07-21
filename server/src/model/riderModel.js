import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleDetails: {
      vehicleType: {
        type: String,
        required: true,
      },
      vehicleNumber: {
        type: String,
        required: true,
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    ratings: [
      {
        customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        review: {
          type: String,
        },
      },
    ],
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Rider = mongoose.model("Rider", riderSchema);

export default Rider;
