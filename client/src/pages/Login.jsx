import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaLock, FaUtensils } from "react-icons/fa";
import api from "../config/ApiConfig";
import useAuth from "../context/useAuth";

const loginHeroBg = `${import.meta.env.BASE_URL}foodTable.webp`;

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!formData.email.trim()) nextErrors.email = "Please enter your email";
    if (!formData.password) nextErrors.password = "Please enter your password";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", formData);
      toast.success(response.data.message || "Welcome back to Cravings!");
      sessionStorage.setItem("cravingUser", JSON.stringify(response.data.data));
      if (response.data.token) sessionStorage.setItem("cravingToken", response.data.token);
      sessionStorage.setItem(`craving${response.data.data.userType[0].toUpperCase()}${response.data.data.userType.slice(1)}User`, JSON.stringify(response.data.data));
      if (response.data.token) sessionStorage.setItem(`craving${response.data.data.userType[0].toUpperCase()}${response.data.data.userType.slice(1)}Token`, response.data.token);
      setUser(response.data.data);
      const dashboards = {
        customer: "/customer-dashboard",
        restaurant: "/restaurant-dashboard",
        rider: "/rider-dashboard",
        admin: "/admin-dashboard",
      };
      navigate(dashboards[response.data.data.userType] || "/");
    } catch (error) {
      toast.error(error.response?.data?.message || "We could not sign you in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8f1] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_rgba(113,52,18,0.16)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[620px] overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
          <img src={loginHeroBg} alt="A welcoming table of food" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#37160d]/95 via-[#8f2f13]/75 to-[#ee6a20]/55" />
          <div className="relative z-10 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-orange-100 backdrop-blur"><FaUtensils /></span>
            <span className="text-2xl font-black tracking-tight">Cravings</span>
          </div>
          <div className="relative z-10 max-w-md">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-orange-200">Good food feels like home</p>
            <h1 className="text-4xl font-black leading-tight xl:text-5xl">Your favorite meals are only a few taps away.</h1>
            <p className="mt-5 text-base leading-7 text-white/80">Sign in to pick up where you left off, reorder your favorites, and follow every delivery from kitchen to door.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[['30 min', 'Typical delivery'], ['4.5+', 'Customer rating'], ['Live', 'Order tracking']].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur"><p className="text-xl font-black">{value}</p><p className="mt-1 text-xs text-white/65">{label}</p></div>
              ))}
            </div>
          </div>
          <p className="relative z-10 text-sm text-white/60">Made for everyday cravings, big and small.</p>
        </section>

        <section className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 lg:hidden"><p className="text-2xl font-black text-orange-700">Cravings</p><p className="mt-1 text-sm text-slate-500">Good food feels like home.</p></div>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700"><FaLock size={11} /> Secure customer login</span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Your next delicious order is waiting for you.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" autoComplete="email" className={`w-full rounded-2xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 ${errors.email ? "border-red-400" : "border-slate-200"}`} />
              {errors.email && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.email}</p>}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label><Link to="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700">Forgot password?</Link></div>
              <div className="relative"><input id="password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" autoComplete="current-password" className={`w-full rounded-2xl border bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 ${errors.password ? "border-red-400" : "border-slate-200"}`} /><button type="button" onClick={() => setShowPassword((previous) => !previous)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div>
              {errors.password && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.password}</p>}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500"><input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} className="h-4 w-4 accent-orange-600" /> Keep me signed in</label>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-red-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <><span className="cravings-spinner" /> Signing you in...</> : <>Sign in to Cravings <FaArrowRight /></>}
            </button>
          </form>
          <div className="my-8 flex items-center gap-3 text-xs font-semibold text-slate-400"><span className="h-px flex-1 bg-slate-200" /> New to Cravings? <span className="h-px flex-1 bg-slate-200" /></div>
          <Link to="/register/customer" className="block w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3.5 text-center text-sm font-black text-orange-700 transition hover:bg-orange-100">Create a customer account</Link>
        </section>
      </div>
    </main>
  );
};

export default Login;
