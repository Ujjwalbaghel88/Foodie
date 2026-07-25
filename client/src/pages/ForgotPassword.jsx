import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../config/ApiConfig";

const forgotPasswordHeroBg = `${import.meta.env.BASE_URL}foodTable.webp`;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [devOtp, setDevOtp] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateRequest = () => {
    const nextErrors = {};
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    return nextErrors;
  };

  const validateReset = () => {
    const nextErrors = {};
    if (!formData.otp.trim()) nextErrors.otp = "OTP is required";
    if (!formData.newPassword) nextErrors.newPassword = "New password is required";
    if (!formData.confirmPassword)
      nextErrors.confirmPassword = "Please confirm your password";
    if (
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    return nextErrors;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const validationErrors = validateRequest();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const res = await api.post("/auth/forgot-password", {
        email: formData.email,
      });

      toast.success(res.data.message);
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const validationErrors = validateReset();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const res = await api.post("/auth/reset-password", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const title = useMemo(
    () => (step === 1 ? "Reset your password" : "Enter OTP and set a new password"),
    [step],
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center px-4 py-10"
      style={{ backgroundImage: `url(${forgotPasswordHeroBg})` }}
    >
      <div className="mx-auto max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-md">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-(--color-primary)">
          Forgot Password
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {step === 1
            ? "We will send a one-time password to your email."
            : "Enter the OTP you received and choose a new password."}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your registered email"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-200 ${
                  errors.email ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-xs font-medium text-red-500">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-(--color-primary) px-4 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Remembered your password?{" "}
              <Link to="/login" className="font-semibold text-(--color-primary)">
                Back to login
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
            {devOtp && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
                Dev OTP: <span className="font-black">{devOtp}</span>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                OTP
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit OTP"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-200 ${
                  errors.otp ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errors.otp && (
                <p className="mt-2 text-xs font-medium text-red-500">{errors.otp}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className={`w-full rounded-xl border px-4 py-3 pr-12 outline-none transition focus:ring-2 focus:ring-orange-200 ${
                    errors.newPassword ? "border-red-500" : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-200 ${
                  errors.confirmPassword ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-(--color-primary) px-4 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full text-sm font-semibold text-(--color-primary) hover:underline"
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
