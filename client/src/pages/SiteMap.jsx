import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaInfoCircle,
  FaConciergeBell,
  FaEnvelope,
  FaCommentDots,
  FaQuestion,
  FaSignInAlt,
  FaUserPlus,
  FaShieldAlt,
  FaFileContract,
  FaMap,
  FaUtensils,
} from "react-icons/fa";

const SITE_SECTIONS = [
  {
    heading: "Main",
    links: [
      { label: "Home", to: "/", icon: <FaHome /> },
      { label: "About Cravings", to: "/about", icon: <FaInfoCircle /> },
      { label: "Order Now", to: "/order-now", icon: <FaConciergeBell /> },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact Us", to: "/contact", icon: <FaEnvelope /> },
      { label: "Feedback", to: "/feedback", icon: <FaCommentDots /> },
      { label: "Help Center", to: "/help-center", icon: <FaQuestion /> },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Login", to: "/login", icon: <FaSignInAlt /> },
      { label: "Register as Customer", to: "/register/customer", icon: <FaUserPlus /> },
      { label: "Register as Restaurant", to: "/register/restaurant", icon: <FaUtensils /> },
      { label: "Register as Rider", to: "/register/rider", icon: <FaUserPlus /> },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy", icon: <FaShieldAlt /> },
      { label: "Terms of Service", to: "/terms-of-service", icon: <FaFileContract /> },
      { label: "Site Map", to: "/site-map", icon: <FaMap /> },
    ],
  },
];

const SiteMap = () => {
  return (
    <div className="bg-(--color-base-100)">

      {/* Hero */}
      <section className="relative h-[40vh] flex items-center justify-center bg-[url('/commonBG.avif')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6">
          <FaMap className="text-5xl text-(--color-primary) mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Site <span className="text-(--color-primary)">Map</span>
          </h1>
          <p className="text-white/75 text-base max-w-xl mx-auto">
            A complete overview of every page on the Cravings platform.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SITE_SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-(--color-primary) mb-4 border-b border-(--color-base-300) pb-2">
                {section.heading}
              </h2>
              <ul className="space-y-3">
                {section.links.map(({ label, to, icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 text-(--color-secondary) text-sm hover:text-(--color-primary) transition-colors group"
                    >
                      <span className="text-(--color-primary)/60 group-hover:text-(--color-primary) transition-colors">
                        {icon}
                      </span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <section className="bg-(--color-primary) py-10 px-6 text-center">
        <p className="text-(--color-neutral-content)/60 text-sm">
          Can't find what you're looking for?{" "}
          <Link to="/help-center" className="text-(--color-neutral-content) hover:underline font-medium">
            Visit our Help Center
          </Link>
          .
        </p>
      </section>

    </div>
  );
};

export default SiteMap;
