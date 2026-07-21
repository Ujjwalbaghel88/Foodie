import React, { useState, useEffect } from "react";
import { MdEdit, MdAdd } from "react-icons/md";
import { FaCamera } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import ImageCropModal from "../ImageCropModal";

const RiderSetting = () => {
  const { user, setUser } = useAuth();
  const [riderData, setRiderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const [uploadCountdown, setUploadCountdown] = useState(0);
  const countdownIntervalRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  // Vehicle & Banking States
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState({
    vehicleType: "",
    vehicleNumber: "",
  });
  const [editingBanking, setEditingBanking] = useState(false);
  const [bankingFormData, setBankingFormData] = useState({
    accountNumber: "",
    IFSC: "",
    bankName: "",
    UPI: "",
  });

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
      fetchRiderData();
    }
  }, [user]);

  const fetchRiderData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/rider/get-rider`);
      setRiderData(response.data.data);
      
      // Initialize form data with existing data
      if (response.data.data?.vehicleDetails) {
        setVehicleFormData(response.data.data.vehicleDetails);
      }
      if (response.data.data?.bankingDetails) {
        setBankingFormData(response.data.data.bankingDetails);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setRiderData(null);
      } else {
        toast.error("Failed to fetch rider data");
      }
    } finally {
      setIsLoading(false);
    }
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
    setUploadCountdown(5);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setUploadCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
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
        }
      );

      const updatedUser = response.data.data;
      setProfileData({
        ...profileData,
        photo: updatedUser.photo.url,
      });

      setUser(updatedUser);
      sessionStorage.setItem("cravingUser", JSON.stringify(updatedUser));

      toast.success("Profile picture updated successfully!");
      setPhotoPreview(null);
      setUploadCountdown(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update profile picture"
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

  // Vehicle handlers
  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicleFormData({ ...vehicleFormData, [name]: value });
  };

  const handleSaveVehicle = async () => {
    try {
      if (!vehicleFormData.vehicleType || !vehicleFormData.vehicleNumber) {
        toast.error("Please fill all vehicle fields");
        return;
      }

      const response = await api.put(`/rider/update-vehicle-details`, vehicleFormData);
      setRiderData(response.data.data);
      setEditingVehicle(false);
      toast.success("Vehicle details updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update vehicle details");
    }
  };

  // Banking handlers
  const handleBankingChange = (e) => {
    const { name, value } = e.target;
    setBankingFormData({ ...bankingFormData, [name]: value });
  };

  const handleSaveBanking = async () => {
    try {
      if (!bankingFormData.accountNumber || !bankingFormData.IFSC || !bankingFormData.bankName) {
        toast.error("Please fill all banking fields");
        return;
      }

      const response = await api.put(`/rider/update-banking-details`, bankingFormData);
      setRiderData(response.data.data);
      setEditingBanking(false);
      toast.success("Banking details updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update banking details");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-(--color-neutral)">Loading...</p>
      </div>
    );
  }

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
              onClick={() => setEditingProfile(true)}
              className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
            >
              <MdEdit /> Edit
            </button>
          )}
        </div>

        {!editingProfile ? (
          <div>
            {photoPreview && (
              <div className="mb-6 bg-(--color-base-100) rounded-lg p-6 border-2 border-(--color-primary)">
                <h4 className="text-sm font-semibold mb-3">
                  Photo Preview (Uploading in {uploadCountdown}s)
                </h4>
                <div className="flex items-center gap-6">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-2 border-(--color-primary)"
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
                  className="w-32 h-32 rounded-full object-cover border-2 border-(--color-primary)"
                />
                <label
                  htmlFor="dpChange"
                  className="absolute bottom-0 right-0 bg-(--color-base-100) p-2 border rounded-full cursor-pointer group"
                >
                  <FaCamera className="text-(--color-primary) group-hover:scale-110 transition-transform" />
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
                  <p className="text-sm text-(--color-neutral)">Name</p>
                  <p className="font-semibold">{profileData.fullName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-(--color-neutral)">Email</p>
                  <p className="font-semibold">{profileData.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-(--color-neutral)">Phone</p>
                  <p className="font-semibold">{profileData.phone}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-6">
            <div className="relative w-36 h-36 shrink-0">
              <img
                src={profileData.photo}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border-2 border-(--color-primary)"
              />
              <label
                htmlFor="dpChange"
                className="absolute bottom-1 right-1 bg-(--color-base-100) p-2 border rounded-full cursor-pointer group"
              >
                <FaCamera className="text-(--color-primary) group-hover:scale-110 transition-transform" />
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

      {/* Vehicle Details Section */}
      <div className="bg-(--color-base-200) rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Vehicle Details</h3>
          {!editingVehicle && (
            <button
              onClick={() => setEditingVehicle(true)}
              className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
            >
              <MdEdit /> Edit
            </button>
          )}
        </div>

        {!editingVehicle ? (
          riderData?.vehicleDetails ? (
            <div className="space-y-2">
              <div className="bg-(--color-base-100) p-3 rounded">
                <p className="text-sm text-(--color-neutral)">Vehicle Type</p>
                <p className="font-semibold">{riderData.vehicleDetails.vehicleType}</p>
              </div>
              <div className="bg-(--color-base-100) p-3 rounded">
                <p className="text-sm text-(--color-neutral)">Vehicle Number</p>
                <p className="font-semibold">{riderData.vehicleDetails.vehicleNumber}</p>
              </div>
            </div>
          ) : (
            <p className="text-(--color-neutral)">No vehicle details added yet</p>
          )
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-2">Vehicle Type</label>
              <input
                type="text"
                name="vehicleType"
                placeholder="e.g., Bike, Car, Bicycle"
                value={vehicleFormData.vehicleType}
                onChange={handleVehicleChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Vehicle Number</label>
              <input
                type="text"
                name="vehicleNumber"
                placeholder="e.g., DL-01-AB-1234"
                value={vehicleFormData.vehicleNumber}
                onChange={handleVehicleChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveVehicle}
                className="flex-1 bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded font-semibold"
              >
                Save Vehicle Details
              </button>
              <button
                onClick={() => setEditingVehicle(false)}
                className="flex-1 bg-(--color-secondary) text-(--color-secondary-content) px-4 py-2 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Banking Details Section */}
      <div className="bg-(--color-base-200) rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Banking Details</h3>
          {!editingBanking && (
            <button
              onClick={() => setEditingBanking(true)}
              className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
            >
              <MdEdit /> Edit
            </button>
          )}
        </div>

        {!editingBanking ? (
          riderData?.bankingDetails ? (
            <div className="space-y-2">
              <div className="bg-(--color-base-100) p-3 rounded">
                <p className="text-sm text-(--color-neutral)">Account Number</p>
                <p className="font-semibold">****{riderData.bankingDetails.accountNumber?.slice(-4)}</p>
              </div>
              <div className="bg-(--color-base-100) p-3 rounded">
                <p className="text-sm text-(--color-neutral)">Bank Name</p>
                <p className="font-semibold">{riderData.bankingDetails.bankName}</p>
              </div>
              <div className="bg-(--color-base-100) p-3 rounded">
                <p className="text-sm text-(--color-neutral)">IFSC</p>
                <p className="font-semibold">{riderData.bankingDetails.IFSC}</p>
              </div>
              <div className="bg-(--color-base-100) p-3 rounded">
                <p className="text-sm text-(--color-neutral)">UPI</p>
                <p className="font-semibold">{riderData.bankingDetails.UPI || "Not added"}</p>
              </div>
            </div>
          ) : (
            <p className="text-(--color-neutral)">No banking details added yet</p>
          )
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                placeholder="Your account number"
                value={bankingFormData.accountNumber}
                onChange={handleBankingChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bank Name</label>
              <input
                type="text"
                name="bankName"
                placeholder="Your bank name"
                value={bankingFormData.bankName}
                onChange={handleBankingChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">IFSC Code</label>
              <input
                type="text"
                name="IFSC"
                placeholder="e.g., SBIN0000123"
                value={bankingFormData.IFSC}
                onChange={handleBankingChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">UPI (Optional)</label>
              <input
                type="text"
                name="UPI"
                placeholder="e.g., yourname@bank"
                value={bankingFormData.UPI}
                onChange={handleBankingChange}
                className="w-full px-3 py-2 border border-(--color-secondary) rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveBanking}
                className="flex-1 bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded font-semibold"
              >
                Save Banking Details
              </button>
              <button
                onClick={() => setEditingBanking(false)}
                className="flex-1 bg-(--color-secondary) text-(--color-secondary-content) px-4 py-2 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default RiderSetting;
