import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import logoCircle from "../assets/circleLogo.png";

const Footer = () => {
  const location = useLocation().pathname;
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  if (location.toLowerCase().includes("dashboard")) return null;

  return (
    <footer className="border-t border-orange-100 bg-[#171412] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="max-w-xl">
            <img src={logoCircle} alt="Cravings Logo" className="h-16 w-16" />
            <h3 className="mt-4 text-xl font-black">Food delivery that feels easy.</h3>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Cravings connects customers with trusted restaurants, fast delivery partners,
              and a smoother way to discover what you want next.
            </p>

            <div className="mt-5 flex gap-3">
              <a
                href="#"
                className="rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                className="rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                aria-label="X"
              >
                <FaXTwitter />
              </a>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
                Quick Links
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm text-white/75">
                <li><button onClick={() => navigate("/")} className="hover:text-white">Home</button></li>
                <li><button onClick={() => navigate("/about")} className="hover:text-white">About</button></li>
                <li><button onClick={() => navigate("/order-now")} className="hover:text-white">Order Now</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
                Restaurants
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm text-white/75">
                <li><button onClick={() => navigate("/register/restaurant")} className="hover:text-white">Partner With Us</button></li>
                <li><button onClick={() => navigate("/restaurant-dashboard")} className="hover:text-white">Dashboard</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
                Riders
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm text-white/75">
                <li><button onClick={() => navigate("/register/rider")} className="hover:text-white">Become a Rider</button></li>
                <li><button onClick={() => navigate("/rider-dashboard")} className="hover:text-white">Rider Dashboard</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
                Support
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm text-white/75">
                <li><button onClick={() => navigate("/feedback")} className="hover:text-white">Feedback</button></li>
                <li><button onClick={() => navigate("/help-center")} className="hover:text-white">Help Center</button></li>
                <li><button onClick={() => navigate("/contact")} className="hover:text-white">Contact</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-white/10" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/60">
            &copy; {currentYear} Cravings. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-5 text-sm text-white/60">
            <Link to="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-white">
              Terms of Service
            </Link>
            <Link to="/site-map" className="hover:text-white">
              Site Map
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
