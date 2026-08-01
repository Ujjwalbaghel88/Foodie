// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import logoLight from "../assets/transparentLogoLight.png";
// import { useAuth } from "../context/AuthContext";
// import { FaPowerOff } from "react-icons/fa";
// import toast from "react-hot-toast";
// import api from "../config/ApiConfig";

// const Navbar = () => {
//   const { user, isLogin, role, setUser, setIsLogin, setRole } = useAuth();
//   const navigate = useNavigate();

//   const handleNavigate = () => {
//     //console.log("Handle Navigate", role);

//     if (role === "customer") {
//       navigate("/customer-dashboard");
//     } else if (role === "restaurant") {
//       navigate("/restaurant-dashboard");
//     } else if (role === "rider") {
//       navigate("/rider-dashboard");
//     } else if (role === "admin") {
//       navigate("/admin-dashboard");
//     } else {
//       navigate("/");
//     }
//   };


//     const handleLogout = async () => {
//     try {
//       const res = await api.get("/auth/logout");
//       toast.success(res.data.message);

//       sessionStorage.removeItem("cravingUser");
//       setUser(null);
//       setIsLogin(false);
//       setRole(null);
//       navigate("/");
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message ||
//         "Unknown error occurred during registration. Please try again.",
//       );
//     }
//   };
//   return (
//     <>
//       <div className="sticky top-0 z-99 flex items-center justify-between px-12 py-1 bg-(--color-primary) text-white w-full h-16 shadow-md">
//         <div className="h-full">
//           <Link to="/">
//             <img src={logoLight} alt="Logo" className="w-fit h-full" />{" "}
//           </Link>
//         </div>

//         {isLogin ? (
//           <div className="flex items-center gap-2">
//             <button
//               className="flex gap-2 items-center text-(--color-primary-content) border border-transparent hover:border-(--color-primary-content)  px-3 py-1 rounded"
//               title="Go to Dashboard"
//               onClick={handleNavigate}
//             >
//               <img
//                 src={user?.photo?.url}
//                 alt={user?.fullName}
//                 className="w-12 h-12 rounded-full object-cover object-top"
//               />
//               <div className="flex flex-col items-start">
//                 <span className="text-base">{user?.fullName}</span>
//                 <span className="text-xs text-(--color-primary-content)/80">
//                   {user?.userType.charAt(0).toUpperCase() +
//                     user?.userType.slice(1)}
//                 </span>
//               </div>
//             </button>
//             <button
//               onClick={handleLogout}
//               className="text-(--color-primary-content) border border-transparent hover:border-(--color-primary-content) hover:bg-(--color-error) px-3 py-3 rounded"
//               title="Logout"
//             >
//               <FaPowerOff />
//             </button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-2">
//             <Link
//               to="/login"
//               className="text-(--color-primary-content) border border-transparent hover:border-(--color-primary-content) px-3 py-1 rounded"
//             >
//               Login
//             </Link>
//             <Link
//               to="/register/customer"
//               className="bg-(--color-primary-content) text-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-primary-content) border px-3 py-1 rounded"
//             >
//               Register
//             </Link>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Navbar;


import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoLight from "../assets/transparentLogoLight.png";
import useAuth from "../context/useAuth";
import { FaPowerOff, FaSearch, FaMapMarkerAlt, FaSignInAlt, FaSignOutAlt, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../config/ApiConfig";

const Navbar = () => {
  const { user, isLogin, role, setUser } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [dishQuery, setDishQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [customerSession, setCustomerSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("cravingCustomerUser")) || null;
    } catch {
      return null;
    }
  });
  const [restaurantSession, setRestaurantSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("cravingRestaurantUser")) || null;
    } catch {
      return null;
    }
  });
  const [adminSession, setAdminSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("cravingAdminUser")) || null;
    } catch {
      return null;
    }
  });
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [showRestaurantLogin, setShowRestaurantLogin] = useState(false);
  const [customerCredentials, setCustomerCredentials] = useState({ email: "", password: "" });
  const [customerLoginLoading, setCustomerLoginLoading] = useState(false);
  const [restaurantLoginLoading, setRestaurantLoginLoading] = useState(false);

  useEffect(() => {
    if (role === "admin" && user) {
      sessionStorage.setItem("cravingAdminUser", JSON.stringify(user));
      setAdminSession(user);
      const activeToken = sessionStorage.getItem("cravingToken");
      if (activeToken) sessionStorage.setItem("cravingAdminToken", activeToken);
    }
  }, [role, user]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = () => {
    if (role === "customer") navigate("/customer-dashboard");
    else if (role === "restaurant") navigate("/restaurant-dashboard");
    else if (role === "rider") navigate("/rider-dashboard");
    else if (role === "admin") navigate("/admin-dashboard");
    else navigate("/");
  };

  const handleLogout = async () => {
    try {
      const res = await api.post("/auth/logout");
      toast.success(res.data.message);
      sessionStorage.removeItem("cravingUser");
      sessionStorage.removeItem("cravingToken");
      sessionStorage.removeItem("cravingAdminUser");
      sessionStorage.removeItem("cravingAdminToken");
      sessionStorage.removeItem("cravingCustomerUser");
      sessionStorage.removeItem("cravingCustomerToken");
      sessionStorage.removeItem("cravingRestaurantUser");
      sessionStorage.removeItem("cravingRestaurantToken");
      setAdminSession(null);
      setCustomerSession(null);
      setRestaurantSession(null);
      setUser(null);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const activateCustomerSession = () => {
    if (!customerSession) {
      setShowCustomerLogin(true);
      return;
    }

    sessionStorage.setItem("cravingUser", JSON.stringify(customerSession));
    sessionStorage.setItem("cravingToken", sessionStorage.getItem("cravingCustomerToken") || "");
    setUser(customerSession);
    navigate("/customer-dashboard");
    toast.success("Customer session opened");
  };

  const handleCustomerLogin = async (event) => {
    event.preventDefault();
    setCustomerLoginLoading(true);
    try {
      const response = await api.post("/auth/login", customerCredentials);
      const loggedInCustomer = response.data.data;
      if (loggedInCustomer.userType !== "customer") {
        toast.error("Please use a customer account here.");
        return;
      }

      if (role === "admin" && user) {
        sessionStorage.setItem("cravingAdminUser", JSON.stringify(user));
        setAdminSession(user);
        const adminToken = sessionStorage.getItem("cravingToken");
        if (adminToken) sessionStorage.setItem("cravingAdminToken", adminToken);
      }
      sessionStorage.setItem("cravingCustomerUser", JSON.stringify(loggedInCustomer));
      sessionStorage.setItem("cravingCustomerToken", response.data.token || "");
      sessionStorage.setItem("cravingUser", JSON.stringify(loggedInCustomer));
      sessionStorage.setItem("cravingToken", response.data.token || "");
      setCustomerSession(loggedInCustomer);
      setUser(loggedInCustomer);
      setShowCustomerLogin(false);
      setCustomerCredentials({ email: "", password: "" });
      navigate("/customer-dashboard");
      toast.success("Customer session opened");
    } catch (error) {
      toast.error(error.response?.data?.message || "Customer login failed");
    } finally {
      setCustomerLoginLoading(false);
    }
  };

  const handleCustomerLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // The local customer session is still removed if the server cookie is unavailable.
    }
    sessionStorage.removeItem("cravingCustomerUser");
    sessionStorage.removeItem("cravingCustomerToken");
    setCustomerSession(null);

    sessionStorage.removeItem("cravingUser");
    sessionStorage.removeItem("cravingToken");
    sessionStorage.removeItem("cravingAdminUser");
    sessionStorage.removeItem("cravingAdminToken");
    sessionStorage.removeItem("cravingCustomerUser");
    sessionStorage.removeItem("cravingCustomerToken");
    setAdminSession(null);
    setCustomerSession(null);
    setUser(null);
    navigate("/");
    toast.success("Logged out. Password will be required next time.");
  };

  const activateRestaurantSession = () => {
    if (!restaurantSession) {
      setShowRestaurantLogin(true);
      return;
    }
    sessionStorage.setItem("cravingUser", JSON.stringify(restaurantSession));
    sessionStorage.setItem("cravingToken", sessionStorage.getItem("cravingRestaurantToken") || "");
    setUser(restaurantSession);
    navigate("/restaurant-dashboard");
    toast.success("Restaurant manager session opened");
  };

  const handleRestaurantLogin = async (event) => {
    event.preventDefault();
    setRestaurantLoginLoading(true);
    try {
      const response = await api.post("/auth/login", customerCredentials);
      const loggedInRestaurant = response.data.data;
      if (loggedInRestaurant.userType !== "restaurant") {
        toast.error("Please use a restaurant manager account here.");
        return;
      }
      if (role === "admin" && user) {
        sessionStorage.setItem("cravingAdminUser", JSON.stringify(user));
        setAdminSession(user);
        const adminToken = sessionStorage.getItem("cravingToken");
        if (adminToken) sessionStorage.setItem("cravingAdminToken", adminToken);
      }
      sessionStorage.setItem("cravingRestaurantUser", JSON.stringify(loggedInRestaurant));
      sessionStorage.setItem("cravingRestaurantToken", response.data.token || "");
      sessionStorage.setItem("cravingUser", JSON.stringify(loggedInRestaurant));
      sessionStorage.setItem("cravingToken", response.data.token || "");
      setRestaurantSession(loggedInRestaurant);
      setUser(loggedInRestaurant);
      setShowRestaurantLogin(false);
      setCustomerCredentials({ email: "", password: "" });
      navigate("/restaurant-dashboard");
      toast.success("Restaurant manager session opened");
    } catch (error) {
      toast.error(error.response?.data?.message || "Restaurant login failed");
    } finally {
      setRestaurantLoginLoading(false);
    }
  };

  const handleRestaurantLogout = () => {
    sessionStorage.removeItem("cravingRestaurantUser");
    sessionStorage.removeItem("cravingRestaurantToken");
    setRestaurantSession(null);
    if (role === "restaurant") {
      const fallbackUser = adminSession || customerSession;
      const fallbackToken = adminSession
        ? sessionStorage.getItem("cravingAdminToken")
        : sessionStorage.getItem("cravingCustomerToken");
      if (fallbackUser) {
        sessionStorage.setItem("cravingUser", JSON.stringify(fallbackUser));
        sessionStorage.setItem("cravingToken", fallbackToken || "");
        setUser(fallbackUser);
        navigate(adminSession ? "/admin-dashboard" : "/customer-dashboard");
      } else {
        setUser(null);
        navigate("/");
      }
    }
    toast.success("Restaurant session logged out");
  };

  const switchBackToAdmin = () => {
    const adminUser = adminSession || JSON.parse(sessionStorage.getItem("cravingAdminUser") || "null");
    if (!adminUser) {
      toast.error("Admin session was not found");
      return;
    }
    sessionStorage.setItem("cravingUser", JSON.stringify(adminUser));
    sessionStorage.setItem("cravingToken", sessionStorage.getItem("cravingAdminToken") || "");
    setUser(adminUser);
    navigate("/admin-dashboard");
    toast.success("Admin session restored");
  };

  const handleSearch = () => {
    const location = locationQuery.trim();
    const search = dishQuery.trim();
    const params = new URLSearchParams();

    if (location) params.set("location", location);
    if (search) params.set("search", search);

    navigate(params.toString() ? `/order-now?${params.toString()}` : "/order-now", {
      state: {
        location,
        search,
      },
    });
    setIsMobileSearchOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <nav
      className={`sticky top-0 z-[999] w-full h-16 bg-(--color-primary) text-white transition-[box-shadow,background-color,transform] duration-300 ${
        isScrolled ? "shadow-xl" : "shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-3 px-4 md:px-8">
        
        {/* LOGO */}
        <div className={`h-full flex items-center transition-transform duration-300 ${isScrolled ? "scale-[0.96]" : "scale-100"}`}>
          <Link to="/">
            <img 
              src={logoLight} 
              alt="Logo" 
              className="h-10 md:h-12 w-auto transition-all" 
            />
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className={`hidden lg:flex items-stretch flex-1 max-w-3xl mx-6 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${isScrolled ? "opacity-100" : "opacity-90"}`}>
           <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-200 min-w-[170px] text-red-500 bg-white">
              <FaMapMarkerAlt className="shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Location"
                className="bg-transparent text-sm font-bold outline-none text-gray-700 w-full placeholder:text-gray-400"
              />
           </div>
           <div className="flex items-center gap-3 px-4 w-full text-gray-400 bg-white">
              <FaSearch size={14} className="shrink-0" />
              <input
                type="text"
                value={dishQuery}
                onChange={(e) => setDishQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for a dish..."
                className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-600 active:scale-95"
              >
                Search
              </button>
           </div>
        </div>

        {/* ACTIONS */}
        {isLogin ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((open) => !open)}
              className="lg:hidden rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Search
            </button>
            <button
              onClick={handleNavigate}
              className="group flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 pl-1.5 pr-3.5 py-1 transition-all duration-300 hover:bg-white/20 hover:shadow-md cursor-pointer"
              title="Go to Dashboard"
            >
              <img
                src={user?.photo?.url}
                alt={user?.fullName}
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-black tracking-tight">
                  {user?.fullName?.split(" ")?.[0] || "User"}
                </span>
                <span className="text-[9px] font-bold uppercase mt-0.5 text-white/70">
                  {user?.userType}
                </span>
              </div>
            </button>

            {role === "admin" ? (
              <>
                <button type="button" onClick={activateCustomerSession} className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20 sm:inline-flex sm:items-center sm:gap-1.5" title="Open customer session">
                  <FaSignInAlt size={12} />{customerSession ? "Customer" : "Customer login"}
                </button>
                <button type="button" onClick={activateRestaurantSession} className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20 sm:inline-flex sm:items-center sm:gap-1.5" title="Open restaurant manager session">
                  <FaSignInAlt size={12} />{restaurantSession ? "Restaurant" : "Manager login"}
                </button>
              </>
            ) : role === "customer" ? (
              <>
                {adminSession && <button type="button" onClick={switchBackToAdmin} className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20 sm:inline-flex">Open Admin</button>}
                <button type="button" onClick={activateRestaurantSession} className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20 sm:inline-flex">{restaurantSession ? "Restaurant" : "Manager login"}</button>
              </>
            ) : role === "restaurant" ? (
              <>
                {adminSession && <button type="button" onClick={switchBackToAdmin} className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20 sm:inline-flex">Open Admin</button>}
                {customerSession && <button type="button" onClick={activateCustomerSession} className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20 sm:inline-flex">Customer</button>}
              </>
            ) : adminSession ? (
              <button
                type="button"
                onClick={switchBackToAdmin}
                className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20 sm:inline-flex sm:items-center sm:gap-1.5"
                title="Return to admin session"
              >
                Open Admin
              </button>
            ) : null}

            {customerSession && (
              <button
                type="button"
                onClick={handleCustomerLogout}
                className="hidden rounded-full bg-white/10 p-2 text-white transition-all duration-300 hover:bg-red-500 sm:inline-flex"
                title="Logout customer session"
              >
                <FaSignOutAlt size={15} />
              </button>
            )}

            {restaurantSession && (
              <button type="button" onClick={handleRestaurantLogout} className="hidden rounded-full bg-white/10 p-2 text-white transition-all duration-300 hover:bg-red-500 sm:inline-flex" title="Logout restaurant manager session">
                <FaSignOutAlt size={15} />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="rounded-full bg-white/10 p-2 transition-all duration-300 text-white hover:bg-red-500"
              title="Logout"
            >
              <FaPowerOff size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 sm:gap-5 font-bold text-sm">
            <Link to="/login" className="hover:scale-105 transition-transform text-white">
              Login
            </Link>
            <Link
              to="/register/customer"
              className="bg-red-500 text-white px-5 py-2 rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {showCustomerLogin && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
          <form onSubmit={handleCustomerLogin} className="relative w-full max-w-md rounded-[2rem] bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setShowCustomerLogin(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close customer login"
            >
              <FaTimes />
            </button>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Secondary session</p>
            <h2 className="mt-2 text-2xl font-black">Login as customer</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Your admin session will stay saved and can be restored anytime.</p>
            <div className="mt-6 space-y-4">
              <input
                type="email"
                required
                value={customerCredentials.email}
                onChange={(event) => setCustomerCredentials((previous) => ({ ...previous, email: event.target.value }))}
                placeholder="Customer email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
              <input
                type="password"
                required
                value={customerCredentials.password}
                onChange={(event) => setCustomerCredentials((previous) => ({ ...previous, password: event.target.value }))}
                placeholder="Customer password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <button type="submit" disabled={customerLoginLoading} className="mt-6 w-full rounded-2xl bg-orange-600 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60">
              {customerLoginLoading ? "Opening customer..." : "Open customer session"}
            </button>
          </form>
        </div>
      )}

      {showRestaurantLogin && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
          <form onSubmit={handleRestaurantLogin} className="relative w-full max-w-md rounded-[2rem] bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
            <button type="button" onClick={() => setShowRestaurantLogin(false)} className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close restaurant login"><FaTimes /></button>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Secondary session</p>
            <h2 className="mt-2 text-2xl font-black">Login as restaurant manager</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Your admin and customer sessions will stay saved.</p>
            <div className="mt-6 space-y-4">
              <input type="email" required value={customerCredentials.email} onChange={(event) => setCustomerCredentials((previous) => ({ ...previous, email: event.target.value }))} placeholder="Manager email" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              <input type="password" required value={customerCredentials.password} onChange={(event) => setCustomerCredentials((previous) => ({ ...previous, password: event.target.value }))} placeholder="Manager password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
            </div>
            <button type="submit" disabled={restaurantLoginLoading} className="mt-6 w-full rounded-2xl bg-orange-600 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60">{restaurantLoginLoading ? "Opening manager..." : "Open manager session"}</button>
          </form>
        </div>
      )}

      {isMobileSearchOpen && (
        <div className="lg:hidden border-t border-white/10 bg-(--color-primary) px-4 py-4 shadow-lg">
          <div className="mx-auto max-w-7xl rounded-2xl border border-white/15 bg-white p-3 shadow-xl">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
                <FaMapMarkerAlt className="shrink-0 text-red-500" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Location"
                  className="w-full bg-transparent text-sm font-semibold outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
                <FaSearch className="shrink-0 text-slate-400" size={14} />
                <input
                  type="text"
                  value={dishQuery}
                  onChange={(e) => setDishQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search dish"
                  className="w-full bg-transparent text-sm font-semibold outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={handleSearch}
                className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
