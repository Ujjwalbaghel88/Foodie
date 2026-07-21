import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../config/ApiConfig";
import toast from "react-hot-toast";
import { FaCamera } from "react-icons/fa";
import MapLocationPicker from "../../MapLocationPicker";
import { FaMapLocationDot } from "react-icons/fa6";

const EditRestaurantModal = ({
  isOpen,
  onClose,
  onSuccess,
  restaurantData,
}) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (restaurantData) {
      setEditData({ ...restaurantData });
    }
  }, [restaurantData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData({
      ...editData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNestedChange = (e, parent) => {
    const { name, value, type, checked } = e.target;
    setEditData({
      ...editData,
      [parent]: {
        ...editData[parent],
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
    // Replace existing images with new ones
    setEditData({
      ...editData,
      images: newImages,
    });
  };

  const removeImage = (index) => {
    setEditData({
      ...editData,
      images: editData.images.filter((_, i) => i !== index),
    });
  };

  const handleLocationSelect = (location) => {
    setEditData({
      ...editData,
      geolocation: { lat: location.lat, lng: location.lng },
    });
    setShowMap(false);
    toast.success("Location updated successfully!");
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      // Create FormData object
      const formDataToSend = new FormData();

      // Add all edit data fields
      formDataToSend.append("restaurantName", editData.restaurantName || "");
      formDataToSend.append("cuisineType", editData.cuisineType || "");
      formDataToSend.append("description", editData.description || "");
      formDataToSend.append("address", editData.address || "");
      formDataToSend.append("city", editData.city || "");
      formDataToSend.append("state", editData.state || "");
      formDataToSend.append("zipCode", editData.zipCode || "");
      formDataToSend.append("country", editData.country || "");
      formDataToSend.append("openingHours", editData.openingHours || "");
      formDataToSend.append("closingHours", editData.closingHours || "");
      formDataToSend.append("isOpen", editData.isOpen || false);

      // Add nested objects as JSON strings
      formDataToSend.append(
        "geolocation",
        JSON.stringify(editData.geolocation || {}),
      );
      formDataToSend.append("licence", JSON.stringify(editData.licence || {}));
      formDataToSend.append(
        "bankingDetails",
        JSON.stringify(editData.bankingDetails || {}),
      );

      // Add image files that have a 'file' property (new uploads)
      if (editData.images && editData.images.length > 0) {
        editData.images.forEach((image) => {
          if (image.file) {
            formDataToSend.append("images", image.file);
          }
        });
      }

      const response = await api.put(
        `/restaurant/update-restaurant`,
        formDataToSend,
      );
      toast.success("Restaurant updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update restaurant");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !editData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-(--color-base-100) rounded-lg shadow-lg max-w-5xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-(--color-base-200) p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Restaurant</h2>
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
            <h3 className="font-semibold text-lg">Basic Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={editData.restaurantName || ""}
                  onChange={handleChange}
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
                  value={editData.cuisineType || ""}
                  onChange={handleChange}
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
                value={editData.description || ""}
                onChange={handleChange}
                placeholder="Brief description of your restaurant"
                rows="3"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded resize-none"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Address Information</h3>
            <input
              type="text"
              name="address"
              value={editData.address || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-(--color-secondary) rounded"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">City</label>
                <input
                  type="text"
                  name="city"
                  value={editData.city || ""}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={editData.state || ""}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={editData.zipCode || ""}
                  onChange={handleChange}
                  placeholder="Zip Code"
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={editData.country || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Lattitude
                </label>
                <input
                  type="text"
                  name="lat"
                  value={editData.geolocation?.lat || ""}
                  placeholder="Latitude"
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Longitude
                </label>
                <input
                  type="text"
                  name="lng"
                  value={editData.geolocation?.lng || ""}
                  placeholder="Longitude"
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Geolocation */}
          <div className="space-y-3 flex items-center gap-5">
            <h3 className="font-semibold text-lg">Restaurant Location</h3>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex items-center gap-2 px-4 py-2 bg-(--color-primary) text-xs text-(--color-primary-content) rounded font-semibold hover:opacity-90"
              >
                <FaMapLocationDot className="text-(--color-primary-content)" />{" "}
                Update Location From Map
              </button>
            </div>
            {showMap && (
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                onClose={() => setShowMap(false)}
                initialLat={editData.geolocation?.lat || 20.5937}
                initialLng={editData.geolocation?.lng || 78.9629}
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
                  value={editData.openingHours || ""}
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
                  value={editData.closingHours || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                />
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">License Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="fssai"
                value={editData.licence?.fssai || ""}
                onChange={(e) => handleNestedChange(e, "licence")}
                placeholder="FSSAI License Number"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
              <input
                type="text"
                name="GST"
                value={editData.licence?.GST || ""}
                onChange={(e) => handleNestedChange(e, "licence")}
                placeholder="GST Number"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
          </div>

          {/* Banking Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Banking Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="bankName"
                value={editData.bankingDetails?.bankName || ""}
                onChange={(e) => handleNestedChange(e, "bankingDetails")}
                placeholder="Bank Name"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
              <input
                type="text"
                name="accountNumber"
                value={editData.bankingDetails?.accountNumber || ""}
                onChange={(e) => handleNestedChange(e, "bankingDetails")}
                placeholder="Account Number"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
              <input
                type="text"
                name="IFSC"
                value={editData.bankingDetails?.IFSC || ""}
                onChange={(e) => handleNestedChange(e, "bankingDetails")}
                placeholder="IFSC Code"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
              <input
                type="text"
                name="UPI"
                value={editData.bankingDetails?.UPI || ""}
                onChange={(e) => handleNestedChange(e, "bankingDetails")}
                placeholder="UPI ID"
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Restaurant Images</h3>

            {/* Upload Images */}
            <label className="cursor-pointer flex items-center justify-center w-full px-3 py-2 border border-(--color-secondary) rounded hover:bg-(--color-base-200)">
              <FaCamera className="inline-block mr-2" />{" "}
              <span>Replace Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Current Images */}
            {editData.images && editData.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Images</p>
                <div className="grid grid-cols-3 gap-3">
                  {editData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.preview || img.URL}
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
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-(--color-primary) text-(--color-primary-content) rounded font-semibold disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurantModal;
