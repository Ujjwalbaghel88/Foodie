import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import RestaurantDashboard from "./pages/dashboard/RestaurantDashboard";
import RiderDashboard from "./pages/dashboard/RiderDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import OrderNow from "./pages/orderProcess/OrderNow";
import RestaurantMenu from "./pages/orderProcess/RestaurantMenu";
import TermsAndConditions from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SiteMap from "./pages/SiteMap";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";
import HelpCenter from "./pages/HelpCenter";
import TermsOfService from "./pages/TermsOfService";

const App = () => {
  
  return (
    <>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/order-now" element={<OrderNow />} />
        <Route path="/restaurant-menu/:restaurantId" element={<RestaurantMenu />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/site-map" element={<SiteMap />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/help-center" element={<HelpCenter />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register/:userType" element={<Register />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
        <Route path="/rider-dashboard" element={<RiderDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
