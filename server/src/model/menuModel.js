import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        itemName: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        image: {
          url: {
            type: String,
          },
          publicId: {
            type: String,
          },
        },
        foodType: {
          type: String,
          enum: [
            "veg",
            "nonveg",
            "egg",
            "vegan",
            "jain",
            "gluten-free",
            "halal",
            "dessert",
            "others",
          ],
          required: true,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
        isDiscontinued: {
          type: Boolean,
          default: false,
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
      },
    ],
  },
  {
    timestamps: true,
  },
);

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);

export default MenuItem;
