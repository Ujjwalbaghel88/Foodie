import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    geolocation: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    cuisineType: {
      type: String,
      required: true,
    },
    images: [
      {
        URL: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    openingHours: {
      type: String,
      required: true,
    },
    closingHours: {
      type: String,
      required: true,
    },
    licence: {
      fssai: {
        type: String,
        required: true,
      },
      GST: {
        type: String,
        required: true,
      },
    },
    bankingDetails: {
      accountNumber: {
        type: String,
        required: true,
      },
      IFSC: {
        type: String,
        required: true,
      },
      bankName: {
        type: String,
        required: true,
      },
      UPI: {
        type: String,
        required: true,
      },
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
