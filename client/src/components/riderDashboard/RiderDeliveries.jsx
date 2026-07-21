import React, { useState, useEffect } from "react";
import MapLocationPicker from "../MapLocationPicker";
import { FaMapLocationDot } from "react-icons/fa6";
import toast from "react-hot-toast";
import api from "../../config/ApiConfig";

const RiderDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  useEffect(() => {
    // TODO: Fetch deliveries from API
    // const fetchDeliveries = async () => {
    //   try {
    //     const response = await api.get("/rider/deliveries");
    //     setDeliveries(response.data);
    //   } catch (error) {
    //     toast.error("Failed to fetch deliveries");
    //   }
    // };
    // fetchDeliveries();
  }, []);

  const handleLocationUpdate = async (location) => {
    try {
      setIsUpdatingLocation(true);
      await api.put("/rider/update-location", {
        lat: location.lat,
        lng: location.lng,
      });
      setShowMap(false);
      setSelectedDelivery(null);
      toast.success("Location updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update location");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const openLocationMap = (delivery) => {
    setSelectedDelivery(delivery);
    setShowMap(true);
  };

  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">Deliveries</h2>
      <div className="bg-(--color-base-200) p-4 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-(--color-secondary)">
              <th className="text-left py-2">Order ID</th>
              <th className="text-left py-2">Restaurant</th>
              <th className="text-left py-2">Delivery Location</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Earnings</th>
              <th className="text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr className="border-b border-(--color-secondary)">
                <td colSpan="6" className="text-center py-4 text-(--color-neutral)">
                  No deliveries
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => (
                <tr key={delivery.id} className="border-b border-(--color-secondary) hover:bg-(--color-base-300)">
                  <td className="py-2">{delivery.orderId}</td>
                  <td className="py-2">{delivery.restaurant}</td>
                  <td className="py-2">{delivery.deliveryLocation}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-(--color-info) text-(--color-info-content) rounded text-xs font-semibold">
                      {delivery.status}
                    </span>
                  </td>
                  <td className="py-2">₹{delivery.earnings}</td>
                  <td className="py-2">
                    <button
                      onClick={() => openLocationMap(delivery)}
                      className="flex items-center gap-1 px-3 py-1 bg-(--color-primary) text-(--color-primary-content) rounded text-sm font-semibold hover:opacity-90 transition cursor-pointer"
                    >
                      <FaMapLocationDot /> Update Location
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Map Location Picker Modal */}
      {showMap && selectedDelivery && (
        <MapLocationPicker
          onLocationSelect={handleLocationUpdate}
          onClose={() => setShowMap(false)}
          initialLat={selectedDelivery.currentLocation?.lat || 20.5937}
          initialLng={selectedDelivery.currentLocation?.lng || 78.9629}
        />
      )}
    </div>
  );
};

export default RiderDeliveries;
