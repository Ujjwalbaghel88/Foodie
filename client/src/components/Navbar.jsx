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
import { useAuth } from "../context/AuthContext";
import { FaPowerOff, FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../config/ApiConfig";

const Navbar = () => {
  const { user, isLogin, role, setUser, setIsLogin, setRole } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
      const res = await api.get("/auth/logout");
      toast.success(res.data.message);
      sessionStorage.removeItem("cravingUser");
      setUser(null);
      setIsLogin(false);
      setRole(null);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <nav className={`sticky top-0 z-[999] w-full transition-all duration-300 bg-(--color-primary) text-white ${
      isScrolled ? "h-14 shadow-xl" : "h-20"
    }`}>
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 md:px-12">
        
        {/* LOGO */}
        <div className="h-full py-2">
          <Link to="/">
            <img 
              src={logoLight} 
              alt="Logo" 
              className="h-full w-auto transition-all" 
            />
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className={`hidden lg:flex items-center flex-1 max-w-xl mx-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all ${isScrolled ? "opacity-100" : "opacity-90"}`}>
           <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-200 min-w-[140px] text-red-500">
              <FaMapMarkerAlt />
              <input type="text" placeholder="Location" className="bg-transparent text-xs font-bold outline-none text-gray-700 w-full" />
           </div>
           <div className="flex items-center gap-3 px-4 w-full text-gray-400">
              <FaSearch size={14} />
              <input type="text" placeholder="Search for restaurant..." className="bg-transparent text-sm w-full outline-none text-gray-700" />
           </div>
        </div>

        {/* ACTIONS */}
        {isLogin ? (
          <div className="flex items-center gap-4">
            <button
              onClick={handleNavigate}
              className="group flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full transition-all border-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:shadow-md cursor-pointer"
              title="Go to Dashboard"
            >
              <img
                src={user?.photo?.url}
                alt={user?.fullName}
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              />
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-black tracking-tight">{user?.fullName.split(' ')[0]}</span>
                <span className="text-[9px] font-bold uppercase mt-0.5 text-white/70">
                  {user?.userType}
                </span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full transition-all bg-white/10 text-white hover:bg-red-500"
              title="Logout"
            >
              <FaPowerOff size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6 font-bold text-sm">
            <Link to="/login" className="hover:scale-105 transition-transform text-white">
              Login
            </Link>
            <Link
              to="/register/customer"
              className="bg-red-500 text-white px-6 py-2.5 rounded-xl shadow-lg hover:bg-red-600 transition-all active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;