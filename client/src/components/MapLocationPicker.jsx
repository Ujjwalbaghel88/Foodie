import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IoClose } from "react-icons/io5";
import { MdMyLocation } from "react-icons/md";
import toast from "react-hot-toast";
import { IoAddCircleSharp, IoRemoveCircleSharp } from "react-icons/io5";

// Fix marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Add smooth animation styles
const addStyles = () => {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .map-modal {
      animation: slideInUp 0.4s ease-out;
    }

    .coordinate-display {
      transition: all 0.3s ease-out;
    }

    .map-button {
      transition: all 0.2s ease;
    }

    .map-button:hover {
      transform: translateY(-1px);
    }

    .leaflet-marker-icon {
      transition: transform 0.3s ease-out !important;
    }

   
  `;
  document.head.appendChild(styleSheet);
};

const MapLocationPicker = ({
  onLocationSelect,
  onClose,
  initialLat,
  initialLng,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [latitude, setLatitude] = useState(initialLat || 20.5937);
  const [longitude, setLongitude] = useState(initialLng || 78.9629);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Add styles on component mount
  useEffect(() => {
    addStyles();
  }, []);

  // Initialize map once
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    try {
      // Create map
      map.current = L.map(mapContainer.current, {
        animate: true,
        zoomAnimation: true,
      }).setView([latitude, longitude], 15);

      // Add OSM tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map.current);

      // Add draggable marker
      marker.current = L.marker([latitude, longitude], {
        icon: defaultIcon,
        draggable: true,
      }).addTo(map.current);

      // Update coordinates when marker is dragged
      marker.current.on("drag", () => {
        const pos = marker.current.getLatLng();
        setLatitude(parseFloat(pos.lat.toFixed(6)));
        setLongitude(parseFloat(pos.lng.toFixed(6)));
      });

      // Update coordinates when map is clicked
      map.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setLatitude(parseFloat(lat.toFixed(6)));
        setLongitude(parseFloat(lng.toFixed(6)));
        marker.current.setLatLng([lat, lng]);
      });

      setIsMapReady(true);
      toast.success("Map loaded successfully!");
    } catch (error) {
      console.error("Map initialization error:", error);
      toast.error("Failed to initialize map");
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change manually with smooth animation
  useEffect(() => {
    if (marker.current && isMapReady) {
      marker.current.setLatLng([latitude, longitude]);
      // Use flyTo for smooth animation instead of setView
      map.current.flyTo([latitude, longitude], 15, {
        duration: 0.8,
        easeLinearity: 0.5,
      });
    }
  }, [latitude, longitude, isMapReady]);

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(parseFloat(lat.toFixed(6)));
          setLongitude(parseFloat(lng.toFixed(6)));
          setIsLoading(false);
          toast.success("Current location detected!");
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
          toast.error(
            "Could not get current location. Using default location.",
          );
        },
      );
    } else {
      setIsLoading(false);
      toast.error("Geolocation not supported");
    }
  };

  const handleConfirm = () => {
    if (latitude && longitude) {
      onLocationSelect({ lat: latitude, lng: longitude });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] max-h-[80vh] flex flex-col map-modal">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-linear-to-r from-(--color-primary) to-[#e2560e] text-(--color-primary-content) transition-all duration-300">
          <h2 className="text-lg font-semibold">Select Location on Map</h2>
          <button
            onClick={onClose}
            className="hover:opacity-80 p-1 rounded transition-all duration-200 hover:scale-110 cursor-pointer"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainer}
          className="flex-1 bg-(--color-base-200) transition-opacity duration-500"
          style={{ minHeight: "300px" }}
        />

        {/* Controls and Coordinates Display */}
        <div className="p-4 bg-(--color-base-100) border-t space-y-3">
          {/* Coordinate Controls with Manual Adjustment */}
          <div className="grid grid-cols-3 gap-3">
            {/* Latitude Control */}
            <div>
              <label className="block text-sm font-semibold text-(--color-neutral) mb-2">
                Latitude
              </label>
              <div className="flex items-center justify-between gap-1 border border-(--color-secondary) rounded-lg px-2 py-2">
                <button
                  onClick={() =>
                    setLatitude((prev) =>
                      parseFloat((prev - 0.0001).toFixed(6)),
                    )
                  }
                  className="cursor-pointer"
                  title="Decrease Latitude"
                >
                  <IoRemoveCircleSharp className="text-2xl hover:text-(--color-primary) transition-transform duration-200" />
                </button>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  step="0.000001"
                  className="text-center"
                  placeholder="Latitude"
                />
                <button
                  onClick={() =>
                    setLatitude((prev) =>
                      parseFloat((prev + 0.0001).toFixed(6)),
                    )
                  }
                  className="cursor-pointer"
                  title="Increase Latitude"
                >
                  <IoAddCircleSharp className="text-2xl hover:text-(--color-primary) transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Longitude Control */}
            <div>
              <label className="block text-sm font-semibold text-(--color-neutral) mb-2">
                Longitude
              </label>
              <div className="flex items-center justify-between gap-1 border border-(--color-secondary) rounded-lg px-2 py-2">
                <button
                  onClick={() =>
                    setLongitude((prev) =>
                      parseFloat((prev - 0.0001).toFixed(6)),
                    )
                  }
                  className="cursor-pointer"
                  title="Decrease Longitude"
                >
                  <IoRemoveCircleSharp className="text-2xl hover:text-(--color-primary) transition-transform duration-200" />
                </button>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  step="0.000001"
                  className="text-center"
                  placeholder="Longitude"
                />
                <button
                  onClick={() =>
                    setLongitude((prev) =>
                      parseFloat((prev + 0.0001).toFixed(6)),
                    )
                  }
                  className="cursor-pointer"
                  title="Increase Longitude"
                >
                  <IoAddCircleSharp className="text-2xl hover:text-(--color-primary) transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Current Location Button */}
            <div className="flex items-end">
              <button
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="w-full bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 map-button cursor-pointer"
              >
                <MdMyLocation className="transition-transform duration-300 text-xl" />
                {isLoading ? "Locating..." : "Current"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-(--color-secondary) rounded-lg hover:bg-(--color-base-200) text-(--color-neutral) font-semibold transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 map-button cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-(--color-success) text-(--color-success-content) rounded-lg hover:opacity-90 font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 map-button cursor-pointer"
            >
              Confirm Location
            </button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-(--color-secondary) text-center animate-pulse">
            🎯 Click on map to place marker or drag the marker to adjust
            location
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
