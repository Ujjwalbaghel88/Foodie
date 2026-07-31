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
import { FaPowerOff, FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../config/ApiConfig";

const Navbar = () => {
  const { user, isLogin, role, setUser } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [dishQuery, setDishQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
      setUser(null);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
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
