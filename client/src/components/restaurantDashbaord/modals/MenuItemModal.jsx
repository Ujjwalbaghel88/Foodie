import React, { useState, useEffect } from "react";
import api from "../../../config/ApiConfig";
import toast from "react-hot-toast";
import { FaCamera } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ImageCropModal from "../../ImageCropModal";

const MenuItemModal = ({ isOpen, onClose, onSuccess, editingItem }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    price: "",
    foodType: "veg",
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        itemName: editingItem.itemName || "",
        description: editingItem.description || "",
        price: editingItem.price || "",
        foodType: editingItem.foodType || "veg",
      });
      setImagePreview(editingItem.image?.url || null);
    } else {
      setFormData({
        itemName: "",
        description: "",
        price: "",
        foodType: "veg",
      });
      setImagePreview(null);
    }
    setSelectedFile(null);
  }, [editingItem, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
      type: "image/jpeg",
    });
    setSelectedFile(croppedFile);
    const preview = URL.createObjectURL(croppedBlob);
    setImagePreview(preview);
    setShowCropModal(false);
    setImageToCrop(null);
    toast.success("Image cropped successfully!");
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (
        !formData.itemName ||
        !formData.description ||
        !formData.price ||
        !formData.foodType
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsSaving(true);

      const formDataToSend = new FormData();
      formDataToSend.append("itemName", formData.itemName);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("foodType", formData.foodType);

      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      let response;
      if (editingItem) {
        // Update existing item
        response = await api.put(
          `/menu/update-item/${editingItem._id}`,
          formDataToSend,
        );
        toast.success("Menu item updated successfully!");
      } else {
        // Add new item
        response = await api.post("/menu/add-item", formDataToSend);
        toast.success("Menu item added successfully!");
      }

      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save menu item");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setImageToCrop(null);
        }}
        image={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
      />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-(--color-base-100) rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-(--color-base-200) p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {editingItem ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-(--color-neutral) hover:bg-(--color-base-100) w-10 h-10 rounded transition cursor-pointer"
          >
            <IoClose className="mx-auto" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Item Name *
            </label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              placeholder="Enter item name"
              className="w-full px-3 py-2 border border-(--color-secondary) rounded focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter item description"
              rows="3"
              className="w-full px-3 py-2 border border-(--color-secondary) rounded focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          {/* Price and Food Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Food Type *
              </label>
              <select
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              >
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-Vegetarian</option>
                <option value="egg">Egg</option>
                <option value="vegan">Vegan</option>
                <option value="jain">Jain</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="halal">Halal</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Item Image
            </label>
            <div className="space-y-2">
              <label className="cursor-pointer w-full px-3 py-2 border border-(--color-secondary) rounded text-center hover:bg-(--color-base-200) flex items-center justify-center gap-2 transition">
                <FaCamera /> <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded text-xs opacity-0 hover:opacity-100 transition cursor-pointer flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-(--color-base-200) p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-(--color-secondary) rounded hover:bg-(--color-base-100) transition disable\d:opacity-50 cursor-pointer"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-(--color-primary) text-(--color-primary-content) rounded font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default MenuItemModal;
