
import React, { useState, useEffect } from "react";
import api from "../../../config/ApiConfig";
import toast from "react-hot-toast";
import { FaCamera, FaFire, FaClock, FaTags } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ImageCropModal from "../../ImageCropModal";

const MenuItemModal = ({ isOpen, onClose, onSuccess, editingItem }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  // --- ZOMATO STYLE PROFESSIONAL STATE ---
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    price: "",
    category: "Main Course",
    foodType: "veg",
    prepTime: "15",
    calories: "",
    label: "None", // Bestseller, Must Try, New Launch
    isAvailable: true,
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        itemName: editingItem.itemName || "",
        description: editingItem.description || "",
        price: editingItem.price || "",
        category: editingItem.category || "Main Course",
        foodType: editingItem.foodType || "veg",
        prepTime: editingItem.prepTime || "15",
        calories: editingItem.calories || "",
        label: editingItem.label || "None",
        isAvailable: editingItem.isAvailable !== undefined ? editingItem.isAvailable : true,
      });
      setImagePreview(editingItem.image?.url || null);
    } else {
      resetForm();
    }
    setSelectedFile(null);
  }, [editingItem, isOpen]);

  const resetForm = () => {
    setFormData({
      itemName: "",
      description: "",
      price: "",
      category: "Main Course",
      foodType: "veg",
      prepTime: "15",
      calories: "",
      label: "None",
      isAvailable: true,
    });
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    const croppedFile = new File([croppedBlob], "dish.jpg", { type: "image/jpeg" });
    setSelectedFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedBlob));
    setShowCropModal(false);
    setImageToCrop(null);
    toast.success("Image Optimized Successfully!");
  };

  const handleSubmit = async () => {
    try {
      if (!formData.itemName || !formData.price) return toast.error("Basic info is required!");
      setIsSaving(true);

      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (selectedFile) data.append("image", selectedFile);

      if (editingItem) {
        await api.put(`/menu/update-item/${editingItem._id}`, data);
        toast.success("Menu Sync Complete! ✨");
      } else {
        await api.post("/menu/add-item", data);
        toast.success("New Dish Is Now Live! 🍲");
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Sync Failed!");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        image={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={1.2}
      />

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100">

          {/* Header Section */}
          <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                {editingItem ? "MANAGE DISH" : "NEW KITCHEN ENTRY"}
                {!formData.isAvailable && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-tighter">Paused</span>}
              </h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Smart Inventory Management</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition cursor-pointer text-gray-400">
              <IoClose size={32} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto space-y-8">

            {/* Identity & Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dish Name *</label>
                <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="w-full px-6 py-4 bg-gray-100/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-gray-800" placeholder="e.g. peri peri paneer" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Menu Group</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-6 py-4 bg-gray-100/50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-700 cursor-pointer focus:bg-white focus:border-red-500">
                  <option>Starters</option>
                  <option>Main Course</option>
                  <option>Quick Bites</option>
                  <option>Beverages</option>
                  <option>Desserts</option>
                </select>
              </div>
            </div>

            {/* Smart Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50/50 p-5 rounded-3xl border border-orange-100/50">
                <label className="text-[10px] font-black text-orange-600 flex items-center gap-1.5 mb-2 uppercase"><FaClock /> Prep Time</label>
                <div className="flex items-baseline gap-1">
                  <input type="number" name="prepTime" value={formData.prepTime} onChange={handleChange} className="w-full bg-transparent text-2xl font-black text-orange-700 outline-none" />
                  <span className="text-[10px] text-orange-400 font-black">MINS</span>
                </div>
              </div>
              <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50">
                <label className="text-[10px] font-black text-emerald-600 flex items-center gap-1.5 mb-2 uppercase"><FaFire /> Energy</label>
                <div className="flex items-baseline gap-1">
                  <input type="number" name="calories" value={formData.calories} onChange={handleChange} className="w-full bg-transparent text-2xl font-black text-emerald-700 outline-none" placeholder="---" />
                  <span className="text-[10px] text-emerald-400 font-black">KCAL</span>
                </div>
              </div>
              <div className="col-span-2 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50">
                <label className="text-[10px] font-black text-indigo-600 flex items-center gap-1.5 mb-2 uppercase"><FaTags /> Marketing Label</label>
                <select name="label" value={formData.label} onChange={handleChange} className="w-full bg-transparent text-sm font-black text-indigo-800 outline-none cursor-pointer">
                  <option value="None">Regular Listing</option>
                  <option value="Bestseller">⭐ Bestseller</option>
                  <option value="Chef Special">👨‍🍳 Chef's Choice</option>
                  <option value="Must Try">🔥 Highly Recommended</option>
                  <option value="New">✨ New Arrival</option>
                </select>
              </div>
            </div>

            {/* Media & Story */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">The Story (Description)</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-gray-200 transition-all italic text-gray-600 leading-relaxed shadow-inner" placeholder="Explain the ingredients and taste..."></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visuals</label>
                <div className="relative group cursor-pointer h-[145px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center hover:border-red-400 transition-all overflow-hidden shadow-sm">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">Replace Media</div>
                    </>
                  ) : (
                    <div className="text-center">
                      <FaCamera size={28} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Upload Photo</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Finance & Stock Bar */}
            <div className="p-8 bg-gray-900 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-8 shadow-2xl border border-white/5">
              <div className="flex items-center gap-5">
                <div className="bg-white/10 p-4 rounded-2xl text-white font-black text-2xl w-14 h-14 flex items-center justify-center">₹</div>
                <div>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="bg-transparent text-4xl font-black text-white border-b-2 border-white/20 focus:border-red-500 outline-none w-44 transition-all" placeholder="0.00" />
                  <label className="text-[9px] font-black text-white/30 block tracking-[0.3em] mt-2 uppercase">Menu Pricing</label>
                </div>
              </div>

              <div className="flex items-center gap-8 bg-white/5 p-6 rounded-[2rem] border border-white/10">
                <div className="text-right">
                  <span className={`text-[11px] font-black uppercase tracking-widest ${formData.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                    {formData.isAvailable ? 'INSTANT LIVE' : 'KITCHEN PAUSED'}
                  </span>
                  <p className="text-[9px] text-white/30 font-bold mt-0.5 uppercase tracking-tighter">Stock Controller</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="sr-only peer" />
                  <div className="w-16 h-8 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-7 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                </label>
              </div>
            </div>

          </div>

          {/* Premium Action Footer */}
          <div className="p-8 bg-white border-t flex justify-end items-center gap-8">
            <button onClick={onClose} className="text-xs font-black text-gray-400 hover:text-gray-900 transition uppercase tracking-[0.2em] cursor-pointer">Discard</button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-16 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-2xl shadow-red-200 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-4 tracking-[0.1em] text-sm cursor-pointer"
            >
              {isSaving ? "SYNCHRONIZING..." : "PUBLISH TO MENU"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuItemModal;