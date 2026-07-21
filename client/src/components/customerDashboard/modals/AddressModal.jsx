import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaMapLocationDot } from "react-icons/fa6";
import MapLocationPicker from "../../MapLocationPicker";
import toast from "react-hot-toast";

const AddressModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  user,
  isEditing,
}) => {
  const [formData, setFormData] = useState({
    ReceiverName: user?.fullName || "",
    ReceiverPhone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    lat: "",
    lng: "",
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        ReceiverName: initialData.ReceiverName || "",
        ReceiverPhone: initialData.ReceiverPhone || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        zipCode: initialData.zipCode || "",
        country: initialData.country || "",
        lat: initialData.geolocation?.lat || "",
        lng: initialData.geolocation?.lng || "",
      });
    } else {
      // Reset to user defaults for new address
      setFormData({
        ReceiverName: user?.fullName || "",
        ReceiverPhone: user?.phone || "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        lat: "",
        lng: "",
      });
    }
  }, [isOpen, initialData, isEditing, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      lat: location.lat,
      lng: location.lng,
    });
    setShowMapPicker(false);
    toast.success("Location selected!");
  };

  const handleSubmit = async () => {
    if (
      !formData.ReceiverName ||
      !formData.ReceiverPhone ||
      !formData.address ||
      !formData.city ||
      !formData.lat ||
      !formData.lng
    ) {
      toast.error("Please fill all address fields including receiver details");
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-4 border-b bg-linear-to-r from-(--color-primary) to-[#e2560e] text-(--color-primary-content)">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onClose}
            className="hover:opacity-80 p-1 rounded transition cursor-pointer"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {/* Receiver Details Section */}
          <div className="bg-(--color-base-100) p-4 rounded-lg border-l-4 border-(--color-primary)">
            <h3 className="text-sm font-semibold text-(--color-neutral) mb-3">
              Delivery To:
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                  Receiver Name
                </label>
                <input
                  type="text"
                  name="ReceiverName"
                  placeholder="Receiver Name"
                  value={formData.ReceiverName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                  Receiver Phone
                </label>
                <input
                  type="tel"
                  name="ReceiverPhone"
                  placeholder="Receiver Phone"
                  value={formData.ReceiverPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-(--color-neutral)">
              Street Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Street Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-(--color-secondary) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          {/* City, State Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-(--color-neutral) mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-(--color-neutral) mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
          </div>

          {/* Zip Code, Country Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-(--color-neutral) mb-1">
                Zip Code
              </label>
              <input
                type="text"
                name="zipCode"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-(--color-neutral) mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
          </div>

          {/* Map Location Section */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="w-full bg-(--color-info) text-(--color-info-content) px-4 py-2 rounded-lg hover:opacity-90 font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FaMapLocationDot /> Select Location on Map
            </button>
          </div>

          {/* Latitude, Longitude Display */}
          <div className="grid grid-cols-2 gap-3 bg-(--color-base-200) p-3 rounded-lg border border-(--color-base-300)">
            <div>
              <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                Latitude
              </label>
              <input
                type="number"
                name="lat"
                placeholder="Latitude"
                value={formData.lat}
                onChange={handleChange}
                step="0.000001"
                disabled
                className="w-full px-3 py-2 border border-(--color-secondary) rounded-lg bg-(--color-base-300) text-(--color-neutral) cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="lng"
                placeholder="Longitude"
                value={formData.lng}
                onChange={handleChange}
                step="0.000001"
                disabled
                className="w-full px-3 py-2 border border-(--color-secondary) rounded-lg bg-(--color-base-300) text-(--color-neutral) cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 border-t bg-(--color-base-200) p-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-(--color-secondary) rounded-lg hover:bg-(--color-base-300) text-(--color-neutral) font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-(--color-success) text-(--color-success-content) rounded-lg hover:opacity-90 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading
              ? "Saving..."
              : isEditing
                ? "Update Address"
                : "Add Address"}
          </button>
        </div>
      </div>

      {/* Map Location Picker Modal */}
      {showMapPicker && (
        <MapLocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMapPicker(false)}
          initialLat={formData.lat}
          initialLng={formData.lng}
        />
      )}
    </div>
  );
};

export default AddressModal;
