import React, { useState, useEffect } from "react";
import { MdEdit, MdAdd } from "react-icons/md";
import { FaCamera } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import AddRestaurantModal from "./modals/AddRestaurantModal";
import EditRestaurantModal from "./modals/EditRestaurantModal";
import ImageCropModal from "../ImageCropModal";

const RestaurantSetting = () => {
  const { user, setUser } = useAuth();
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // User Profile States
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    photo: user?.photo?.url || "https://via.placeholder.com/150",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadCountdown, setUploadCountdown] = useState(0);
  const countdownIntervalRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  // Update profileData when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        photo: user.photo?.url || "https://via.placeholder.com/150",
      });
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user?.fullName, user?.email, user?.phone, user?.photo]);

  useEffect(() => {
    if (user?._id) {
      fetchRestaurantData();
    }
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/restaurant/get-restaurant`);
      setRestaurantData(response.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setRestaurantData(null);
      } else {
        toast.error("Failed to fetch restaurant data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchRestaurantData();
  };

  const handleEditSuccess = () => {
    fetchRestaurantData();
  };

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileImageChange = (e) => {
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
    const preview = URL.createObjectURL(croppedBlob);
    setPhotoPreview(preview);
    setPhotoFile(croppedFile);
    setUploadCountdown(5);

    // Start countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setUploadCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          // Auto upload when countdown reaches 0
          uploadProfilePhoto(croppedFile);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setShowCropModal(false);
    setImageToCrop(null);
  };

  const uploadProfilePhoto = async (file) => {
    try {
      setIsUploadingPhoto(true);

      const formDataToSend = new FormData();
      formDataToSend.append("photo", file);

      const response = await api.put(
        `/auth/update-profile-picture`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Update profile data with new photo
      const updatedUser = response.data.data;
      setProfileData({
        ...profileData,
        photo: updatedUser.photo.url,
      });

      // Update auth context and sessionStorage
      setUser(updatedUser);
      sessionStorage.setItem("cravingUser", JSON.stringify(updatedUser));

      toast.success("Profile picture updated successfully!");
      // Reset preview
      setPhotoPreview(null);
      setPhotoFile(null);
      setUploadCountdown(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update profile picture",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelPhotoUpload = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setPhotoPreview(null);
    setPhotoFile(null);
    setUploadCountdown(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);

      const response = await api.put(`/auth/update-profile/`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });

      const updatedUser = response.data.data;
      setProfileData({
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        photo: updatedUser.photo?.url || "https://via.placeholder.com/150",
      });

      // Update auth context and sessionStorage
      setUser(updatedUser);
      sessionStorage.setItem("cravingUser", JSON.stringify(updatedUser));

      setEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setFormData({
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
    });
    setEditingProfile(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-(--color-neutral)">Loading...</p>
      </div>
    );
  }

  // First Time User - No Restaurant Data
  if (!restaurantData) {
    return (
      <div className="overflow-y-auto h-full p-6 space-y-6">
        {/* User Profile Section */}
        <div className="bg-(--color-base-200) rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Profile Information</h3>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
            >
              <MdEdit /> {editingProfile ? "Cancel" : "Edit"}
            </button>
          </div>

          {!editingProfile ? (
            // Display Mode
            <div className="flex items-center gap-6">
              <img
                src={profileData.photo}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-(--color-primary) object-top"
              />
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-(--color-neutral) mb-1">Name</p>
                  <p className="font-semibold">{profileData.fullName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-(--color-neutral) mb-1">Email</p>
                  <p className="font-semibold">{profileData.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-(--color-neutral) mb-1">Phone</p>
                  <p className="font-semibold">{profileData.phone}</p>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={profileData.photo}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-(--color-primary)"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="flex-1 px-3 py-2 border border-(--color-secondary) rounded"
                    disabled={isUploadingPhoto || uploadCountdown > 0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="bg-(--color-primary) text-(--color-primary-content) px-6 py-2 rounded font-semibold disabled:opacity-50"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelProfile}
                  className="bg-(--color-secondary) text-(--color-secondary-content) px-6 py-2 rounded font-semibold"
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Data Not Available */}
        <div className="bg-(--color-base-200) rounded-lg p-8 text-center space-y-6">
          <h3 className="text-xl font-semibold">
            Restaurant Data Not Available
          </h3>
          <p className="text-(--color-neutral) max-w-md mx-auto">
            Get started by adding your restaurant details. This will help you
            manage your menu, orders, and more.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition mx-auto"
          >
            <MdAdd size={20} /> Add Restaurant Details
          </button>
        </div>

        <AddRestaurantModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      </div>
    );
  }

  // Restaurant Exists - Display Data
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
      <div className="overflow-y-auto h-full p-6 space-y-6">
      {/* User Profile Section */}
      <div className="bg-(--color-base-200) rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
            >
              <MdEdit /> Edit
            </button>
          )}
        </div>

        {!editingProfile ? (
          // Display Mode
          <div>
            {photoPreview && (
              // Photo Preview Section with Countdown
              <div className="mb-6 bg-(--color-base-100) rounded-lg p-6 border-2 border-(--color-primary)">
                <h4 className="text-sm font-semibold mb-3">
                  Photo Preview (Uploading in {uploadCountdown}s)
                </h4>
                <div className="flex items-center gap-6">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-2 border-(--color-primary) object-top"
                  />
                  <div className="flex flex-col gap-3">
                    <div className="w-80 bg-(--color-base-200) rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-(--color-primary) h-full transition-all duration-100"
                        style={{ width: `${(uploadCountdown / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-(--color-neutral)">
                      {uploadCountdown > 0
                        ? `Uploading in ${uploadCountdown} seconds...`
                        : "Uploading..."}
                    </p>
                    <button
                      onClick={handleCancelPhotoUpload}
                      className="bg-(--color-error) text-(--color-error-content) px-4 py-2 rounded font-semibold w-fit disabled:opacity-50"
                      disabled={isUploadingPhoto || uploadCountdown === 0}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={profileData.photo}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-2 border-(--color-primary) object-top"
                />
                <label
                  htmlFor="dpChange"
                  className="absolute bottom-0 right-0 bg-(--color-base-100) p-2 border rounded-full cursor-pointer group"
                >
                  <FaCamera className="text-(--color-primary) group-hover:scale-110 transition-transform" />{" "}
                </label>
                <input
                  type="file"
                  name="photo"
                  id="dpChange"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  disabled={isUploadingPhoto || uploadCountdown > 0}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-(--color-neutral) mb-1">Name</p>
                  <p className="font-semibold">{profileData.fullName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-(--color-neutral) mb-1">Email</p>
                  <p className="font-semibold">{profileData.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-(--color-neutral) mb-1">Phone</p>
                  <p className="font-semibold">{profileData.phone}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="flex items-start gap-6">
            <div className="relative w-36 h-36 shrink-0">
              <img
                src={profileData.photo}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border-2 border-(--color-primary) object-top"
              />
              <label
                htmlFor="dpChange"
                className="absolute bottom-1 right-1 bg-(--color-base-100) p-2 border rounded-full cursor-pointer group"
              >
                <FaCamera className="text-(--color-primary) group-hover:scale-110 transition-transform" />{" "}
              </label>
              <input
                type="file"
                name="photo"
                id="dpChange"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
                disabled={isUploadingPhoto}
              />
            </div>

            <div className="space-y-4 w-full">
              <div className="grid grid-cols-5 gap-2">
                <label className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded col-span-4"
                />

                <label className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded col-span-4"
                />

                <label className="block text-sm font-semibold mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-(--color-secondary) rounded col-span-4"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="bg-(--color-primary) text-(--color-primary-content) px-6 py-2 rounded font-semibold disabled:opacity-50"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelProfile}
                  className="bg-(--color-secondary) text-(--color-secondary-content) px-6 py-2 rounded font-semibold"
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Restaurant Settings Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Restaurant Information</h3>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
          >
            <MdEdit size={18} /> Edit Restaurant
          </button>
        </div>

        {/* Basic Information */}
        <div className="bg-(--color-base-200) rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-(--color-base-100) p-4 rounded">
              <p className="text-sm text-(--color-neutral) mb-1">Restaurant</p>
              <p className="font-semibold text-lg">
                {restaurantData.restaurantName}
              </p>
            </div>
            <div className="bg-(--color-base-100) p-4 rounded">
              <p className="text-sm text-(--color-neutral) mb-1">
                Cuisine Type
              </p>
              <p className="font-semibold">{restaurantData.cuisineType}</p>
            </div>
          </div>
          <div className="bg-(--color-base-100) p-4 rounded">
            <p className="text-sm text-(--color-neutral) mb-2">Description</p>
            <p className="font-semibold text-base leading-relaxed">
              {restaurantData.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-(--color-base-200) rounded-lg p-6">
          <div className="bg-(--color-base-100) p-2 rounded flex items-center mb-4 gap-5">
            <p className="text-lg font-semibold">Address: </p>
            <p>{restaurantData.address}</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">City</p>
              <p className="font-semibold">{restaurantData.city}</p>
            </div>
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">State</p>
              <p className="font-semibold">{restaurantData.state}</p>
            </div>
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">Zip Code</p>
              <p className="font-semibold">{restaurantData.zipCode}</p>
            </div>
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">Country</p>
              <p className="font-semibold">{restaurantData.country}</p>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-(--color-base-200) rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">Opening</p>
              <p className="font-semibold">{restaurantData.openingHours}</p>
            </div>
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">Closing</p>
              <p className="font-semibold">{restaurantData.closingHours}</p>
            </div>
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">Status</p>
              <p className="font-semibold">
                {restaurantData.isOpen ? "✅ Open" : "❌ Closed"}
              </p>
            </div>
          </div>
        </div>

        {/* License Information */}
        <div className="bg-(--color-base-200) rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">License Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">FSSAI</p>
              <p className="font-semibold">{restaurantData.licence?.fssai}</p>
            </div>
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">GST Number</p>
              <p className="font-semibold">{restaurantData.licence?.GST}</p>
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div className="bg-(--color-base-200) rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Banking Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">Bank Name</p>
              <p className="font-semibold">
                {restaurantData.bankingDetails?.bankName}
              </p>
            </div>
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">Account</p>
              <p className="font-semibold">
                {restaurantData.bankingDetails?.accountNumber}
              </p>
            </div>
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">IFSC</p>
              <p className="font-semibold">
                {restaurantData.bankingDetails?.IFSC}
              </p>
            </div>
            <div className="bg-(--color-base-100) p-3 rounded">
              <p className="text-sm text-(--color-neutral)">UPI</p>
              <p className="font-semibold">
                {restaurantData.bankingDetails?.UPI}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      {restaurantData.images && restaurantData.images.length > 0 && (
        <div className="bg-(--color-base-200) rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Restaurant Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {restaurantData.images.map((img, idx) => (
              <img
                key={idx}
                src={img.URL}
                alt={`Restaurant ${idx + 1}`}
                className="w-full h-64 object-contain rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <EditRestaurantModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        restaurantData={restaurantData}
      />
    </div>
    </>
  );
};

export default RestaurantSetting;
