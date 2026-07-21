import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../config/ApiConfig";
import toast from "react-hot-toast";
import { FaCamera } from "react-icons/fa";
import MapLocationPicker from "../../MapLocationPicker";

const AddRestaurantModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    restaurantName: "",
    cuisineType: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    openingHours: "09:00",
    closingHours: "21:00",
    isOpen: true,
    geolocation: { lat: 0, lng: 0 },
    licence: { fssai: "", GST: "" },
    bankingDetails: { bankName: "", accountNumber: "", IFSC: "", UPI: "" },
    images: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNestedChange = (e, parent) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages],
    });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      geolocation: { lat: location.lat, lng: location.lng },
    });
    setShowMap(false);
    toast.success("Location selected successfully!");
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (
        !formData.restaurantName ||
        !formData.cuisineType ||
        !formData.description ||
        !formData.address ||
        !formData.city ||
        !formData.state ||
        !formData.zipCode ||
        !formData.country ||
        !formData.licence.fssai ||
        !formData.licence.GST ||
        !formData.bankingDetails.bankName ||
        !formData.bankingDetails.accountNumber ||
        !formData.bankingDetails.IFSC ||
        !formData.bankingDetails.UPI
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsSaving(true);

      // Create FormData object
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("restaurantName", formData.restaurantName);
      formDataToSend.append("cuisineType", formData.cuisineType);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("zipCode", formData.zipCode);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("openingHours", formData.openingHours);
      formDataToSend.append("closingHours", formData.closingHours);
      formDataToSend.append("isOpen", formData.isOpen);

      // Add nested objects as JSON strings
      formDataToSend.append(
        "geolocation",
        JSON.stringify(formData.geolocation),
      );
      formDataToSend.append("licence", JSON.stringify(formData.licence));
      formDataToSend.append(
        "bankingDetails",
        JSON.stringify(formData.bankingDetails),
      );

      // Add image files
      formData.images.forEach((image) => {
        formDataToSend.append("images", image.file);
      });

      const res = await api.post(
        `/restaurant/create-restaurant`,
        formDataToSend,
      );
      toast.success(res.data.message);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create restaurant");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-(--color-base-100) rounded-lg shadow-lg max-w-5xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-(--color-base-200) p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Add Restaurant</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-(--color-neutral) hover:bg-(--color-base-100) w-10 h-10 rounded"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Basic Information *</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  placeholder="Enter restaurant name"
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleChange}
                  placeholder="e.g., Italian, Chinese"
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your restaurant (e.g., specialty dishes, ambiance, etc.)"
                rows="3"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded resize-none"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Address Information *</h3>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter street address"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded text-sm"
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded text-sm"
              />
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Zip Code"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded text-sm"
              />
            </div>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              className="w-full px-3 py-2 border border-(--color-secondary) rounded"
            />
          </div>

          {/* Geolocation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Restaurant Location</h3>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="px-4 py-2 bg-(--color-primary) text-(--color-primary-content) rounded font-semibold hover:opacity-90"
              >
                Pick Location on Map
              </button>
              {formData.geolocation.lat !== 0 && formData.geolocation.lng !== 0 && (
                <span className="text-sm text-(--color-secondary)">
                  Selected: ({formData.geolocation.lat.toFixed(4)}, {formData.geolocation.lng.toFixed(4)})
                </span>
              )}
            </div>
            {showMap && (
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                onClose={() => setShowMap(false)}
                initialLat={formData.geolocation.lat || 20.5937}
                initialLng={formData.geolocation.lng || 78.9629}
              />
            )}
          </div>

          {/* Operating Hours */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Operating Hours</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Opening Time
                </label>
                <input
                  type="time"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Closing Time
                </label>
                <input
                  type="time"
                  name="closingHours"
                  value={formData.closingHours}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                />
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">License Information *</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="fssai"
                value={formData.licence.fssai}
                onChange={(e) => handleNestedChange(e, "licence")}
                placeholder="FSSAI License Number"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
              <input
                type="text"
                name="GST"
                value={formData.licence.GST}
                onChange={(e) => handleNestedChange(e, "licence")}
                placeholder="GST Number"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
          </div>

          {/* Banking Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Banking Details *</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="bankName"
                value={formData.bankingDetails.bankName}
                onChange={(e) => handleNestedChange(e, "bankingDetails")}
                placeholder="Bank Name"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
              <input
                type="text"
                name="accountNumber"
                value={formData.bankingDetails.accountNumber}
                onChange={(e) => handleNestedChange(e, "bankingDetails")}
                placeholder="Account Number"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
              <input
                type="text"
                name="IFSC"
                value={formData.bankingDetails.IFSC}
                onChange={(e) => handleNestedChange(e, "bankingDetails")}
                placeholder="IFSC Code"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
              <input
                type="text"
                name="UPI"
                value={formData.bankingDetails.UPI}
                onChange={(e) => handleNestedChange(e, "bankingDetails")}
                placeholder="UPI ID"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Restaurant Images</h3>
            <label className="cursor-pointer w-full px-3 py-2 border border-(--color-secondary) rounded text-center hover:bg-(--color-base-200) flex items-center justify-center gap-2">
              <FaCamera /> <span>Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.preview}
                      alt={`${idx + 1}`}
                      className="w-full h-64 object-contain rounded"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-(--color-base-200) p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-(--color-secondary) rounded hover:bg-(--color-base-100)"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-(--color-primary) text-(--color-primary-content) rounded font-semibold disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create Restaurant"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurantModal;
