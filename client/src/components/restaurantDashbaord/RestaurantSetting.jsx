// import React, { useState, useEffect } from "react";
// import { MdEdit, MdAdd } from "react-icons/md";
// import { FaCamera } from "react-icons/fa";
// import { FaMapLocationDot } from "react-icons/fa6";
// import { useAuth } from "../../context/AuthContext";
// import api from "../../config/ApiConfig";
// import toast from "react-hot-toast";
// import AddRestaurantModal from "./modals/AddRestaurantModal";
// import EditRestaurantModal from "./modals/EditRestaurantModal";
// import ImageCropModal from "../ImageCropModal";

// const RestaurantSetting = () => {
//   const { user, setUser } = useAuth();
//   const [restaurantData, setRestaurantData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);

//   // User Profile States
//   const [profileData, setProfileData] = useState({
//     fullName: user?.fullName || "",
//     email: user?.email || "",
//     phone: user?.phone || "",
//     photo: user?.photo?.url || "https://via.placeholder.com/150",
//   });
//   const [editingProfile, setEditingProfile] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: user?.fullName || "",
//     email: user?.email || "",
//     phone: user?.phone || "",
//   });
//   const [isSavingProfile, setIsSavingProfile] = useState(false);
//   const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [photoFile, setPhotoFile] = useState(null);
//   const [uploadCountdown, setUploadCountdown] = useState(0);
//   const countdownIntervalRef = React.useRef(null);
//   const fileInputRef = React.useRef(null);
//   const [showCropModal, setShowCropModal] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);

//   // Update profileData when user changes
//   useEffect(() => {
//     if (user) {
//       setProfileData({
//         fullName: user.fullName || "",
//         email: user.email || "",
//         phone: user.phone || "",
//         photo: user.photo?.url || "https://via.placeholder.com/150",
//       });
//       setFormData({
//         fullName: user.fullName || "",
//         email: user.email || "",
//         phone: user.phone || "",
//       });
//     }
//   }, [user?.fullName, user?.email, user?.phone, user?.photo]);

//   useEffect(() => {
//     if (user?._id) {
//       fetchRestaurantData();
//     }
//   }, [user]);

//   const fetchRestaurantData = async () => {
//     try {
//       setIsLoading(true);
//       const response = await api.get(`/restaurant/get-restaurant`);
//       setRestaurantData(response.data.data);
//     } catch (err) {
//       if (err.response?.status === 404) {
//         setRestaurantData(null);
//       } else {
//         toast.error("Failed to fetch restaurant data");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddSuccess = () => {
//     fetchRestaurantData();
//   };

//   const handleEditSuccess = () => {
//     fetchRestaurantData();
//   };

//   // Profile handlers
//   const handleProfileChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleProfileImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImageToCrop(reader.result);
//         setShowCropModal(true);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleCropComplete = (croppedBlob) => {
//     const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
//       type: "image/jpeg",
//     });
//     const preview = URL.createObjectURL(croppedBlob);
//     setPhotoPreview(preview);
//     setPhotoFile(croppedFile);
//     setUploadCountdown(5);

//     // Start countdown
//     if (countdownIntervalRef.current) {
//       clearInterval(countdownIntervalRef.current);
//     }

//     countdownIntervalRef.current = setInterval(() => {
//       setUploadCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(countdownIntervalRef.current);
//           // Auto upload when countdown reaches 0
//           uploadProfilePhoto(croppedFile);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     setShowCropModal(false);
//     setImageToCrop(null);
//   };

//   const uploadProfilePhoto = async (file) => {
//     try {
//       setIsUploadingPhoto(true);

//       const formDataToSend = new FormData();
//       formDataToSend.append("photo", file);

//       const response = await api.put(
//         `/auth/update-profile-picture`,
//         formDataToSend,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         },
//       );

//       // Update profile data with new photo
//       const updatedUser = response.data.data;
//       setProfileData({
//         ...profileData,
//         photo: updatedUser.photo.url,
//       });

//       // Update auth context and sessionStorage
//       setUser(updatedUser);
//       sessionStorage.setItem("cravingUser", JSON.stringify(updatedUser));

//       toast.success("Profile picture updated successfully!");
//       // Reset preview
//       setPhotoPreview(null);
//       setPhotoFile(null);
//       setUploadCountdown(0);
//       // Reset file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message || "Failed to update profile picture",
//       );
//     } finally {
//       setIsUploadingPhoto(false);
//     }
//   };

//   const handleCancelPhotoUpload = () => {
//     if (countdownIntervalRef.current) {
//       clearInterval(countdownIntervalRef.current);
//     }
//     setPhotoPreview(null);
//     setPhotoFile(null);
//     setUploadCountdown(0);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const handleSaveProfile = async () => {
//     try {
//       setIsSavingProfile(true);

//       const response = await api.put(`/auth/update-profile/`, {
//         fullName: formData.fullName,
//         email: formData.email,
//         phone: formData.phone,
//       });

//       const updatedUser = response.data.data;
//       setProfileData({
//         fullName: updatedUser.fullName || "",
//         email: updatedUser.email || "",
//         phone: updatedUser.phone || "",
//         photo: updatedUser.photo?.url || "https://via.placeholder.com/150",
//       });

//       // Update auth context and sessionStorage
//       setUser(updatedUser);
//       sessionStorage.setItem("cravingUser", JSON.stringify(updatedUser));

//       setEditingProfile(false);
//       toast.success("Profile updated successfully!");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to update profile");
//     } finally {
//       setIsSavingProfile(false);
//     }
//   };

//   const handleCancelProfile = () => {
//     setFormData({
//       fullName: profileData.fullName,
//       email: profileData.email,
//       phone: profileData.phone,
//     });
//     setEditingProfile(false);
//   };

//   if (isLoading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <p className="text-(--color-neutral)">Loading...</p>
//       </div>
//     );
//   }

//   // First Time User - No Restaurant Data
//   if (!restaurantData) {
//     return (
//       <div className="overflow-y-auto h-full p-6 space-y-6">
//         {/* User Profile Section */}
//         <div className="bg-(--color-base-200) rounded-lg p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Profile Information</h3>
//             <button
//               onClick={() => setEditingProfile(!editingProfile)}
//               className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
//             >
//               <MdEdit /> {editingProfile ? "Cancel" : "Edit"}
//             </button>
//           </div>

//           {!editingProfile ? (
//             // Display Mode
//             <div className="flex items-center gap-6">
//               <img
//                 src={profileData.photo}
//                 alt="Profile"
//                 className="w-32 h-32 rounded-full object-cover border-2 border-(--color-primary) object-top"
//               />
//               <div className="space-y-3">
//                 <div className="flex items-center gap-4">
//                   <p className="text-sm text-(--color-neutral) mb-1">Name</p>
//                   <p className="font-semibold">{profileData.fullName}</p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <p className="text-sm text-(--color-neutral) mb-1">Email</p>
//                   <p className="font-semibold">{profileData.email}</p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <p className="text-sm text-(--color-neutral) mb-1">Phone</p>
//                   <p className="font-semibold">{profileData.phone}</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             // Edit Mode
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold mb-2">
//                   Profile Picture
//                 </label>
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={profileData.photo}
//                     alt="Profile"
//                     className="w-20 h-20 rounded-full object-cover border-2 border-(--color-primary)"
//                   />
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     accept="image/*"
//                     onChange={handleProfileImageChange}
//                     className="flex-1 px-3 py-2 border border-(--color-secondary) rounded"
//                     disabled={isUploadingPhoto || uploadCountdown > 0}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleProfileChange}
//                   className="w-full px-3 py-2 border border-(--color-secondary) rounded"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleProfileChange}
//                   className="w-full px-3 py-2 border border-(--color-secondary) rounded"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleProfileChange}
//                   className="w-full px-3 py-2 border border-(--color-secondary) rounded"
//                 />
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   onClick={handleSaveProfile}
//                   className="bg-(--color-primary) text-(--color-primary-content) px-6 py-2 rounded font-semibold disabled:opacity-50"
//                   disabled={isSavingProfile}
//                 >
//                   {isSavingProfile ? "Saving..." : "Save Changes"}
//                 </button>
//                 <button
//                   onClick={handleCancelProfile}
//                   className="bg-(--color-secondary) text-(--color-secondary-content) px-6 py-2 rounded font-semibold"
//                   disabled={isSavingProfile}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Restaurant Data Not Available */}
//         <div className="bg-(--color-base-200) rounded-lg p-8 text-center space-y-6">
//           <h3 className="text-xl font-semibold">
//             Restaurant Data Not Available
//           </h3>
//           <p className="text-(--color-neutral) max-w-md mx-auto">
//             Get started by adding your restaurant details. This will help you
//             manage your menu, orders, and more.
//           </p>
//           <button
//             onClick={() => setShowAddModal(true)}
//             className="flex items-center justify-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition mx-auto"
//           >
//             <MdAdd size={20} /> Add Restaurant Details
//           </button>
//         </div>

//         <AddRestaurantModal
//           isOpen={showAddModal}
//           onClose={() => setShowAddModal(false)}
//           onSuccess={handleAddSuccess}
//         />
//       </div>
//     );
//   }

//   // Restaurant Exists - Display Data
//   return (
//     <>
//       <ImageCropModal
//         isOpen={showCropModal}
//         onClose={() => {
//           setShowCropModal(false);
//           setImageToCrop(null);
//         }}
//         image={imageToCrop}
//         onCropComplete={handleCropComplete}
//         aspectRatio={1}
//       />
//       <div className="overflow-y-auto h-full p-6 space-y-6">
//       {/* User Profile Section */}
//       <div className="bg-(--color-base-200) rounded-lg p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold">Profile Information</h3>
//           {!editingProfile && (
//             <button
//               onClick={() => setEditingProfile(!editingProfile)}
//               className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
//             >
//               <MdEdit /> Edit
//             </button>
//           )}
//         </div>

//         {!editingProfile ? (
//           // Display Mode
//           <div>
//             {photoPreview && (
//               // Photo Preview Section with Countdown
//               <div className="mb-6 bg-(--color-base-100) rounded-lg p-6 border-2 border-(--color-primary)">
//                 <h4 className="text-sm font-semibold mb-3">
//                   Photo Preview (Uploading in {uploadCountdown}s)
//                 </h4>
//                 <div className="flex items-center gap-6">
//                   <img
//                     src={photoPreview}
//                     alt="Preview"
//                     className="w-32 h-32 rounded-full object-cover border-2 border-(--color-primary) object-top"
//                   />
//                   <div className="flex flex-col gap-3">
//                     <div className="w-80 bg-(--color-base-200) rounded-full h-2 overflow-hidden">
//                       <div
//                         className="bg-(--color-primary) h-full transition-all duration-100"
//                         style={{ width: `${(uploadCountdown / 5) * 100}%` }}
//                       ></div>
//                     </div>
//                     <p className="text-sm text-(--color-neutral)">
//                       {uploadCountdown > 0
//                         ? `Uploading in ${uploadCountdown} seconds...`
//                         : "Uploading..."}
//                     </p>
//                     <button
//                       onClick={handleCancelPhotoUpload}
//                       className="bg-(--color-error) text-(--color-error-content) px-4 py-2 rounded font-semibold w-fit disabled:opacity-50"
//                       disabled={isUploadingPhoto || uploadCountdown === 0}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div className="flex items-center gap-6">
//               <div className="relative">
//                 <img
//                   src={profileData.photo}
//                   alt="Profile"
//                   className="w-32 h-32 rounded-full object-cover border-2 border-(--color-primary) object-top"
//                 />
//                 <label
//                   htmlFor="dpChange"
//                   className="absolute bottom-0 right-0 bg-(--color-base-100) p-2 border rounded-full cursor-pointer group"
//                 >
//                   <FaCamera className="text-(--color-primary) group-hover:scale-110 transition-transform" />{" "}
//                 </label>
//                 <input
//                   type="file"
//                   name="photo"
//                   id="dpChange"
//                   ref={fileInputRef}
//                   accept="image/*"
//                   onChange={handleProfileImageChange}
//                   className="hidden"
//                   disabled={isUploadingPhoto || uploadCountdown > 0}
//                 />
//               </div>
//               <div className="space-y-3">
//                 <div className="flex items-center gap-4">
//                   <p className="text-sm text-(--color-neutral) mb-1">Name</p>
//                   <p className="font-semibold">{profileData.fullName}</p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <p className="text-sm text-(--color-neutral) mb-1">Email</p>
//                   <p className="font-semibold">{profileData.email}</p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <p className="text-sm text-(--color-neutral) mb-1">Phone</p>
//                   <p className="font-semibold">{profileData.phone}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           // Edit Mode
//           <div className="flex items-start gap-6">
//             <div className="relative w-36 h-36 shrink-0">
//               <img
//                 src={profileData.photo}
//                 alt="Profile"
//                 className="w-36 h-36 rounded-full object-cover border-2 border-(--color-primary) object-top"
//               />
//               <label
//                 htmlFor="dpChange"
//                 className="absolute bottom-1 right-1 bg-(--color-base-100) p-2 border rounded-full cursor-pointer group"
//               >
//                 <FaCamera className="text-(--color-primary) group-hover:scale-110 transition-transform" />{" "}
//               </label>
//               <input
//                 type="file"
//                 name="photo"
//                 id="dpChange"
//                 ref={fileInputRef}
//                 accept="image/*"
//                 onChange={handleProfileImageChange}
//                 className="hidden"
//                 disabled={isUploadingPhoto}
//               />
//             </div>

//             <div className="space-y-4 w-full">
//               <div className="grid grid-cols-5 gap-2">
//                 <label className="block text-sm font-semibold mb-2">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleProfileChange}
//                   className="w-full px-3 py-2 border border-(--color-secondary) rounded col-span-4"
//                 />

//                 <label className="block text-sm font-semibold mb-2">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleProfileChange}
//                   className="w-full px-3 py-2 border border-(--color-secondary) rounded col-span-4"
//                 />

//                 <label className="block text-sm font-semibold mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleProfileChange}
//                   className="w-full px-3 py-2 border border-(--color-secondary) rounded col-span-4"
//                 />
//               </div>

//               <div className="flex gap-2 justify-end">
//                 <button
//                   onClick={handleSaveProfile}
//                   className="bg-(--color-primary) text-(--color-primary-content) px-6 py-2 rounded font-semibold disabled:opacity-50"
//                   disabled={isSavingProfile}
//                 >
//                   {isSavingProfile ? "Saving..." : "Save Changes"}
//                 </button>
//                 <button
//                   onClick={handleCancelProfile}
//                   className="bg-(--color-secondary) text-(--color-secondary-content) px-6 py-2 rounded font-semibold"
//                   disabled={isSavingProfile}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Restaurant Settings Section */}
//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <h3 className="text-lg font-semibold">Restaurant Information</h3>
//           <button
//             onClick={() => setShowEditModal(true)}
//             className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
//           >
//             <MdEdit size={18} /> Edit Restaurant
//           </button>
//         </div>

//         {/* Basic Information */}
//         <div className="bg-(--color-base-200) rounded-lg p-6">
//           <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
//           <div className="grid grid-cols-2 gap-6 mb-6">
//             <div className="bg-(--color-base-100) p-4 rounded">
//               <p className="text-sm text-(--color-neutral) mb-1">Restaurant</p>
//               <p className="font-semibold text-lg">
//                 {restaurantData.restaurantName}
//               </p>
//             </div>
//             <div className="bg-(--color-base-100) p-4 rounded">
//               <p className="text-sm text-(--color-neutral) mb-1">
//                 Cuisine Type
//               </p>
//               <p className="font-semibold">{restaurantData.cuisineType}</p>
//             </div>
//           </div>
//           <div className="bg-(--color-base-100) p-4 rounded">
//             <p className="text-sm text-(--color-neutral) mb-2">Description</p>
//             <p className="font-semibold text-base leading-relaxed">
//               {restaurantData.description || "No description provided"}
//             </p>
//           </div>
//         </div>

//         {/* Address Information */}
//         <div className="bg-(--color-base-200) rounded-lg p-6">
//           <div className="bg-(--color-base-100) p-2 rounded flex items-center mb-4 gap-5">
//             <p className="text-lg font-semibold">Address: </p>
//             <p>{restaurantData.address}</p>
//           </div>

//           <div className="grid grid-cols-4 gap-4">
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">City</p>
//               <p className="font-semibold">{restaurantData.city}</p>
//             </div>
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">State</p>
//               <p className="font-semibold">{restaurantData.state}</p>
//             </div>
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">Zip Code</p>
//               <p className="font-semibold">{restaurantData.zipCode}</p>
//             </div>
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">Country</p>
//               <p className="font-semibold">{restaurantData.country}</p>
//             </div>
//           </div>
//         </div>

//         {/* Operating Hours */}
//         <div className="bg-(--color-base-200) rounded-lg p-6">
//           <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
//           <div className="grid grid-cols-3 gap-4">
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">Opening</p>
//               <p className="font-semibold">{restaurantData.openingHours}</p>
//             </div>
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">Closing</p>
//               <p className="font-semibold">{restaurantData.closingHours}</p>
//             </div>
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">Status</p>
//               <p className="font-semibold">
//                 {restaurantData.isOpen ? "✅ Open" : "❌ Closed"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* License Information */}
//         <div className="bg-(--color-base-200) rounded-lg p-6">
//           <h3 className="text-lg font-semibold mb-4">License Information</h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">FSSAI</p>
//               <p className="font-semibold">{restaurantData.licence?.fssai}</p>
//             </div>
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">GST Number</p>
//               <p className="font-semibold">{restaurantData.licence?.GST}</p>
//             </div>
//           </div>
//         </div>

//         {/* Banking Details */}
//         <div className="bg-(--color-base-200) rounded-lg p-6">
//           <h3 className="text-lg font-semibold mb-4">Banking Details</h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">Bank Name</p>
//               <p className="font-semibold">
//                 {restaurantData.bankingDetails?.bankName}
//               </p>
//             </div>
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">Account</p>
//               <p className="font-semibold">
//                 {restaurantData.bankingDetails?.accountNumber}
//               </p>
//             </div>
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">IFSC</p>
//               <p className="font-semibold">
//                 {restaurantData.bankingDetails?.IFSC}
//               </p>
//             </div>
//             <div className="bg-(--color-base-100) p-3 rounded">
//               <p className="text-sm text-(--color-neutral)">UPI</p>
//               <p className="font-semibold">
//                 {restaurantData.bankingDetails?.UPI}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Images */}
//       {restaurantData.images && restaurantData.images.length > 0 && (
//         <div className="bg-(--color-base-200) rounded-lg p-6">
//           <h3 className="text-lg font-semibold mb-4">Restaurant Images</h3>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//             {restaurantData.images.map((img, idx) => (
//               <img
//                 key={idx}
//                 src={img.URL}
//                 alt={`Restaurant ${idx + 1}`}
//                 className="w-full h-64 object-contain rounded-lg"
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       <EditRestaurantModal
//         isOpen={showEditModal}
//         onClose={() => setShowEditModal(false)}
//         onSuccess={handleEditSuccess}
//         restaurantData={restaurantData}
//       />
//     </div>
//     </>
//   );
// };

// export default RestaurantSetting;


import React, { useState, useEffect } from "react";
import { MdEdit, MdAdd, MdVerified, MdLocationOn, MdAccountBalance, MdDescription } from "react-icons/md";
import { FaCamera, FaStore, FaClock, FaIdCard } from "react-icons/fa";
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
  }, [user]);

  useEffect(() => {
    if (user?._id) fetchRestaurantData();
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/restaurant/get-restaurant`);
      setRestaurantData(response.data.data);
    } catch (err) {
      if (err.response?.status !== 404) toast.error("Failed to fetch business data");
      setRestaurantData(null);
    } finally {
      setIsLoading(false);
    }
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
    const croppedFile = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
    setPhotoPreview(URL.createObjectURL(croppedBlob));
    setUploadCountdown(5);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
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
  };

  const uploadProfilePhoto = async (file) => {
    try {
      setIsUploadingPhoto(true);
      const data = new FormData();
      data.append("photo", file);
      const response = await api.put(`/auth/update-profile-picture`, data);
      setUser(response.data.data);
      sessionStorage.setItem("cravingUser", JSON.stringify(response.data.data));
      toast.success("Identity Photo Updated!");
      setPhotoPreview(null);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const response = await api.put(`/auth/update-profile/`, formData);
      setUser(response.data.data);
      sessionStorage.setItem("cravingUser", JSON.stringify(response.data.data));
      setEditingProfile(false);
      toast.success("Profile Updated!");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center font-bold text-gray-400">LOADING HUB...</div>;

  return (
    <div className="overflow-y-auto h-full p-6 space-y-8 bg-gray-50/50 custom-scrollbar">

      <ImageCropModal isOpen={showCropModal} image={imageToCrop} onCropComplete={handleCropComplete} aspectRatio={1} />

      {/* SECTION: MERCHANT IDENTITY */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-red-500 to-orange-500 opacity-90"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 flex flex-wrap items-end justify-between gap-6">
            <div className="relative group">
              <img src={photoPreview || profileData.photo} alt="Profile" className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white" />
              <label className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <FaCamera className="text-red-500" />
                <input type="file" className="hidden" onChange={handleProfileImageChange} />
              </label>
              {uploadCountdown > 0 && (
                <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center text-white font-black text-2xl">{uploadCountdown}</div>
              )}
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                {profileData.fullName} <MdVerified className="text-blue-500" size={20} />
              </h2>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{user?.role} Account</p>
            </div>
            <button onClick={() => setEditingProfile(!editingProfile)} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition flex items-center gap-2">
              <MdEdit /> {editingProfile ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {editingProfile && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 ml-1">FULL NAME</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 ml-1">EMAIL ADDRESS</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-bold" />
              </div>
              <div className="flex items-end">
                <button onClick={handleSaveProfile} disabled={isSavingProfile} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-100">{isSavingProfile ? "SAVING..." : "SAVE PROFILE"}</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION: BUSINESS DETAILS */}
      {!restaurantData ? (
        <div className="p-12 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStore className="text-red-500" size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-800">Ready to start selling?</h3>
          <p className="text-gray-500 font-medium mb-6">Your business profile is empty. Let's set up your restaurant.</p>
          <button onClick={() => setShowAddModal(true)} className="px-10 py-4 bg-red-500 text-white rounded-2xl font-black flex items-center gap-2 mx-auto hover:bg-red-600 transition shadow-xl shadow-red-100">
            <MdAdd size={24} /> REGISTER BUSINESS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Store Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black flex items-center gap-3"><FaStore className="text-red-500" /> BUSINESS INFO</h3>
                <button onClick={() => setShowEditModal(true)} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400"><MdEdit size={20} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Store Name</p>
                  <p className="text-lg font-black text-gray-800">{restaurantData.restaurantName}</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase">
                    {restaurantData.cuisineType}
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest flex items-center gap-1"><FaClock /> Timings</p>
                  <p className="text-lg font-black text-gray-800">{restaurantData.openingHours} - {restaurantData.closingHours}</p>
                  <p className={`mt-2 font-bold text-xs ${restaurantData.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                    {restaurantData.isOpen ? '● ACCEPTING ORDERS' : '○ CURRENTLY CLOSED'}
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-gray-900 p-8 rounded-[2rem] text-white">
                <p className="text-[10px] font-black text-white/40 mb-3 uppercase tracking-widest flex items-center gap-1"><MdLocationOn className="text-red-400" /> Primary Location</p>
                <p className="text-lg font-bold leading-relaxed">{restaurantData.address}</p>
                <div className="mt-4 flex gap-4 text-xs font-bold text-white/60">
                  <span>{restaurantData.city}, {restaurantData.state}</span>
                  <span>PIN: {restaurantData.zipCode}</span>
                </div>
              </div>
            </div>

            {/* License & Legal */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3"><FaIdCard className="text-blue-500" /> LEGAL & COMPLIANCE</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="bg-white p-3 rounded-xl shadow-sm font-black text-blue-600">FSSAI</div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">License Number</p>
                    <p className="font-bold text-gray-700">{restaurantData.licence?.fssai || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <div className="bg-white p-3 rounded-xl shadow-sm font-black text-purple-600">GST</div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Registration</p>
                    <p className="font-bold text-gray-700">{restaurantData.licence?.GST || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Banking & Gallery */}
          <div className="space-y-8">
            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3"><MdAccountBalance className="text-green-400" /> SETTLEMENTS</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Receiving Bank</p>
                  <p className="text-lg font-bold">{restaurantData.bankingDetails?.bankName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">A/C Number</p>
                  <p className="text-md font-mono tracking-tighter text-white/80">****{restaurantData.bankingDetails?.accountNumber?.slice(-4)}</p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2">Primary UPI Handle</p>
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold truncate">{restaurantData.bankingDetails?.UPI}</div>
                </div>
              </div>
            </div>

            {/* Mini Gallery */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-gray-400">Store Front Gallery</h3>
              <div className="grid grid-cols-2 gap-2">
                {restaurantData.images?.slice(0, 4).map((img, idx) => (
                  <img key={idx} src={img.URL} className="w-full h-24 object-cover rounded-2xl bg-gray-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddRestaurantModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchRestaurantData} />
      <EditRestaurantModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={fetchRestaurantData} restaurantData={restaurantData} />
    </div>
  );
};

export default RestaurantSetting;