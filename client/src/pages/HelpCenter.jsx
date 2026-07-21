import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FaQuestionCircle,
  FaShoppingBag,
  FaCreditCard,
  FaMotorcycle,
  FaUser,
} from "react-icons/fa";
import helpBg from "../assets/HelpPage.jpg";

const ISSUE_CATEGORIES = [
  "Account & Profile",
  "Order Issues",
  "Payment & Billing",
  "Delivery Problem",
  "Restaurant / Menu",
  "Other",
];

const FAQ = [
  {
    icon: <FaShoppingBag />,
    question: "How do I track my order?",
    answer:
      "Go to your dashboard → Orders and click on the active order to see live tracking.",
  },
  {
    icon: <FaCreditCard />,
    question: "How do I get a refund?",
    answer:
      "Submit a ticket below with your Order ID and our team will process it within 2–3 business days.",
  },
  {
    icon: <FaMotorcycle />,
    question: "My rider is late. What do I do?",
    answer:
      "You can contact your rider directly via the order page or raise a support ticket.",
  },
  {
    icon: <FaUser />,
    question: "How do I update my account info?",
    answer:
      "Navigate to your dashboard → Settings to update your profile details.",
  },
];

const HelpCenter = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    issueCategory: "",
    orderId: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!data.issueCategory)
      newErrors.issueCategory = "Please select an issue category";
    if (!data.description.trim())
      newErrors.description = "Please describe your issue";
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
      toast.success(
        "Support ticket submitted! We'll reach out within 24 hours.",
      );
      setFormData({
        fullName: "",
        email: "",
        issueCategory: "",
        orderId: "",
        description: "",
      });
      setErrors({});
      setLoading(false);
    }, 1000);
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary) bg-white/60 ${
      errors[field]
        ? "border-(--color-error) border-2"
        : "border-(--color-base-300)"
    }`;

  const translucent = "bg-black/70 backdrop-blur-sm";

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-[url('/HelpPage.jpg')] bg-cover bg-center p-10">
      {/* Two-column card */}
      <div
        className="bg-black/60 backdrop-blur-sm rounded-xl shadow-xl w-full max-w-5xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 pt-8 pb-4 px-10">
          <FaQuestionCircle className="text-(--color-primary) text-2xl" />
          <h1 className="text-3xl font-bold text-(--color-primary)">
            Help Center
          </h1>
        </div>
        <p className="text-(--color-secondary-content) text-center mb-6 px-10">
          Browse FAQs or submit a support ticket below.
        </p>

        {/* Columns */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200/80 px-0">
          {/* LEFT — FAQ Accordion */}
          <div className="md:w-1/2 px-10 pb-8">
            <h2 className="text-(--color-neutral-content) font-semibold mb-4 text-sm uppercase tracking-wide">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-2">
              {FAQ.map((item, index) => (
                <div
                  key={index}
                  className="border border-(--color-base-100) rounded-md overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-(--color-neutral-content) hover:bg-white/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-(--color-primary-content)">
                        {item.icon}
                      </span>
                      {item.question}
                    </span>
                    <span className="text-(--color-secondary-content)">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === index && (
                    <p className="px-4 pb-3 text-sm text-(--color-secondary-content) bg-white/30">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Support Ticket Form */}
          <div className="md:w-1/2 px-10 pb-8">
            <h2 className="text-(--color-neutral-content) font-semibold mb-4 text-sm uppercase tracking-wide">
              Submit a Support Ticket
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-4">
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

              {/* Issue Category */}
              <div className="mb-4">
              
                <select
                  name="issueCategory"
                  value={formData.issueCategory}
                  onChange={handleInputChange}
                  className={inputClass("issueCategory")}
                >
                  <option value="">Select issue type</option>
                  {ISSUE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.issueCategory && (
                  <span className="text-(--color-error) text-xs mt-1 block">
                    {errors.issueCategory}
                  </span>
                )}
              </div>

              {/* Order ID (optional) */}
              <div className="mb-4">
               
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  placeholder="e.g. ORD-00123"
                  className={inputClass("orderId")}
                />
              </div>

              {/* Description */}
              <div className="mb-6">
              
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please describe the problem in detail..."
                  rows={4}
                  className={inputClass("description") + " resize-none"}
                />
                {errors.description && (
                  <span className="text-(--color-error) text-xs mt-1 block">
                    {errors.description}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-(--color-primary) text-white font-semibold rounded-md hover:bg-orange-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
