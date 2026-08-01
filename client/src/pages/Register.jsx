import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../config/ApiConfig";

const registerHeroBg = `${import.meta.env.BASE_URL}foodTable.webp`;

const Register = () => {
  const userType = useParams().userType; // Get userType from URL params (if needed)
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: userType || "customer",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUserTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      userType: e.target.value,
    }));
  };

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!data.phone.trim()) newErrors.phone = "Phone number is required";
    if (!data.password || data.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!data.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (data.password !== data.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!data.agreeTerms)
      newErrors.agreeTerms = "You must agree to terms and conditions";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    console.log("Form submitted:", formData);

    try {
      const res = await api.post("/auth/register", formData);
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during registration. Please try again.",
      );
    } finally {
      setLoading(false);
    }
    // Handle registration here
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8f1] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_rgba(113,52,18,0.16)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden min-h-[680px] overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-end lg:p-14">
          <img src={registerHeroBg} alt="Fresh food served at a table" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#37160d]/95 via-[#8f2f13]/75 to-[#ee6a20]/35" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-200">Welcome to the table</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">Make every craving count.</h1>
            <p className="mt-4 max-w-sm text-base leading-7 text-white/80">Save your favorites, reorder in seconds, and enjoy a smoother food journey with Cravings.</p>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">Saved favorites</span><span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">Easy reorders</span><span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">Live updates</span></div>
          </div>
        </section>
        <div className="px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
        <div className="mb-8 lg:hidden"><p className="text-2xl font-black text-orange-700">Cravings</p><p className="mt-1 text-sm text-slate-500">Make every craving count.</p></div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-2 mb-8 text-sm leading-6 text-slate-500">Join Cravings and get your favorite food delivered with less effort.</p>

        {/* User Type Selection */}
        <div className="mb-6">
            <label className="mb-3 block text-sm font-bold text-slate-700">
            Register as:
          </label>
          <div className="flex gap-5">
            {["customer", "restaurant", "rider"].map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <input
                  type="radio"
                  name="userType"
                  value={type}
                  checked={formData.userType === type}
                  onChange={handleUserTypeChange}
                  className="cursor-pointer"
                />
                <span className="capitalize text-slate-700">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={`w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
                errors.fullName
                  ? "border-(--color-error) border-2"
                  : "border-(--color-base-300)"
              }`}
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
              className={`w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
                errors.email
                  ? "border-(--color-error) border-2"
                  : "border-(--color-base-300)"
              }`}
            />
            {errors.email && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="mb-4">
           
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className={`w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
                errors.phone
                  ? "border-(--color-error) border-2"
                  : "border-(--color-base-300)"
              }`}
            />
            {errors.phone && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.phone}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
          
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={`w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
                errors.password
                  ? "border-(--color-error) border-2"
                  : "border-(--color-base-300)"
              }`}
            />
            {errors.password && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className={`w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
                errors.confirmPassword
                  ? "border-(--color-error) border-2"
                  : "border-(--color-base-300)"
              }`}
            />
            {errors.confirmPassword && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.confirmPassword}
              </span>
            )}
          </div>
          <div className="mb-6">
            <label className="flex items-start gap-2 cursor-pointer text-(--color-secondary)">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                className="mt-1 cursor-pointer"
              />
              <span className="text-sm">
                I agree to the{" "}
                <span className="text-(--color-primary) hover:underline">
                  terms and conditions.
                </span>
              </span>
            </label>
            {errors.agreeTerms && (
              <span className="text-(--color-error) text-xs mt-1 block ml-7">
                {errors.agreeTerms}
              </span>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="mb-4 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-red-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-(--color-primary) font-semibold hover:underline"
          >
            Login here
          </Link>
        </p>
        </div>
      </div>
    </main>
  );
};

export default Register;
