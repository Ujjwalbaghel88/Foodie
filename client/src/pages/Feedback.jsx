import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaStar } from "react-icons/fa";
import feedbackBg from "../assets/FeedbackPage.jpeg";

const CATEGORIES = ["Food Quality", "Delivery Experience", "App & Website", "Customer Support", "Pricing & Value"];

const Feedback = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    category: "",
    rating: 0,
    message: "",
  });

  const [hoveredStar, setHoveredStar] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!data.category) newErrors.category = "Please select a category";
    if (!data.rating) newErrors.rating = "Please provide a rating";
    if (!data.message.trim()) newErrors.message = "Feedback message is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Thank you for your feedback!");
      setFormData({ fullName: "", email: "", category: "", rating: 0, message: "" });
      setErrors({});
      setLoading(false);
    }, 1000);
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
      errors[field]
        ? "border-(--color-error) border-2"
        : "border-(--color-base-300)"
    }`;

  return (
    <div
      className="h-[90vh] flex items-center justify-end bg-[url('/FeedbackPage.jpeg')] bg-cover bg-center p-10 md:pe-30"
    >
      <div className="bg-white rounded-lg shadow-md px-10 py-6 max-w-md w-full overflow-y-auto max-h-[85vh]">
        <h1 className="text-3xl font-bold text-(--color-primary) mb-2 text-center">
          Share Feedback
        </h1>
        <p className="text-(--color-secondary) text-center mb-5">
          Help us improve your Cravings experience.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-(--color-neutral) font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={inputClass("fullName")}
            />
            {errors.fullName && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-(--color-neutral) font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={inputClass("email")}
            />
            {errors.email && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.email}
              </span>
            )}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-(--color-neutral) font-semibold mb-2">
              Feedback Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={inputClass("category")}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.category}
              </span>
            )}
          </div>

          {/* Star Rating */}
          <div className="mb-4 flex gap-6 items-center">
            <label className="block text-(--color-neutral) font-semibold">
              Overall Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-2xl transition-colors duration-150"
                >
                  <FaStar
                    className={
                      star <= (hoveredStar || formData.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.rating}
              </span>
            )}
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-(--color-neutral) font-semibold mb-2">
              Your Feedback
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us about your experience..."
              rows={3}
              className={inputClass("message") + " resize-none"}
            />
            {errors.message && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-(--color-primary) text-white font-semibold rounded-md hover:bg-orange-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
