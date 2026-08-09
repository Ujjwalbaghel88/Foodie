import React, { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const CustomerDashboard = lazy(() => import("./pages/dashboard/CustomerDashboard"));
const RestaurantDashboard = lazy(() => import("./pages/dashboard/RestaurantDashboard"));
const RiderDashboard = lazy(() => import("./pages/dashboard/RiderDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const OrderNow = lazy(() => import("./pages/orderProcess/OrderNow"));
const RestaurantMenu = lazy(() => import("./pages/orderProcess/RestaurantMenu"));
const BakeryCrav = lazy(() => import("./pages/orderProcess/BakeryCrav"));
const CheckoutPage = lazy(() => import("./pages/orderProcess/CheckoutPage"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const SiteMap = lazy(() => import("./pages/SiteMap"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Feedback = lazy(() => import("./pages/Feedback"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));

const App = () => {
  return (
    <>
      <Toaster />
      <Navbar />
      <Suspense fallback={<div className="grid min-h-[50vh] place-items-center text-orange-700">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/order-now" element={<OrderNow />} />
          <Route path="/restaurant-menu/:restaurantId" element={<RestaurantMenu />} />
          <Route path="/bakery-crav" element={<BakeryCrav />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track-order/:orderId" element={<CheckoutPage />} />
          <Route path="/terms-and-conditions" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/site-map" element={<SiteMap />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register/:userType" element={<Register />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/rider-dashboard" element={<RiderDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
};

export default App;
