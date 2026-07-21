import React, { useState } from "react";
import { FaShieldAlt, FaDatabase, FaCookieBite, FaUserLock, FaEnvelope, FaChevronDown, FaChevronUp } from "react-icons/fa";

const SECTIONS = [
  {
    icon: <FaDatabase className="text-xl text-(--color-primary)" />,
    title: "Information We Collect",
    content: [
      "Account information: name, email address, phone number, and password when you register.",
      "Profile data: delivery addresses, profile photos, and payment preferences.",
      "Order history: restaurants visited, items ordered, and transaction records.",
      "Device & usage data: IP address, browser type, pages visited, and timestamps.",
      "Location data: GPS coordinates when you place an order or browse nearby restaurants.",
    ],
  },
  {
    icon: <FaShieldAlt className="text-xl text-(--color-primary)" />,
    title: "How We Use Your Information",
    content: [
      "To process and fulfill your food orders and coordinate delivery.",
      "To personalise your experience and recommend relevant restaurants.",
      "To communicate order updates, promotions, and service announcements.",
      "To improve our platform through analytics and performance monitoring.",
      "To comply with legal obligations and resolve disputes.",
    ],
  },
  {
    icon: <FaUserLock className="text-xl text-(--color-primary)" />,
    title: "Sharing Your Information",
    content: [
      "With partner restaurants to fulfill your orders.",
      "With delivery riders to complete your delivery.",
      "With payment processors to handle transactions securely.",
      "With analytics providers (anonymized or aggregated data only).",
      "With law enforcement when required by applicable law.",
      "We never sell your personal data to third parties for marketing purposes.",
    ],
  },
  {
    icon: <FaCookieBite className="text-xl text-(--color-primary)" />,
    title: "Cookies & Tracking",
    content: [
      "We use essential cookies to keep you logged in and maintain session state.",
      "Analytics cookies help us understand how users navigate the platform.",
      "You can disable non-essential cookies in your browser settings at any time.",
      "We use third-party services (e.g. Google Analytics) that may set their own cookies.",
    ],
  },
  {
    icon: <FaDatabase className="text-xl text-(--color-primary)" />,
    title: "Data Retention",
    content: [
      "We retain your account data for as long as your account is active.",
      "Order history is retained for up to 5 years for legal and financial compliance.",
      "You may request deletion of your account and associated data at any time.",
      "Some data may be retained in anonymized form for analytics even after deletion.",
    ],
  },
  {
    icon: <FaUserLock className="text-xl text-(--color-primary)" />,
    title: "Your Rights",
    content: [
      "Access: request a copy of the personal data we hold about you.",
      "Correction: update or correct inaccurate information via your account settings.",
      "Deletion: request erasure of your personal data (subject to legal retention requirements).",
      "Portability: receive your data in a structured, machine-readable format.",
      "Objection: opt out of marketing communications at any time.",
    ],
  },
];

const AccordionItem = ({ section, isOpen, onToggle }) => (
  <div className="border border-(--color-base-300) rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left bg-(--color-base-100) hover:bg-(--color-base-200) transition-colors"
    >
      <span className="flex items-center gap-3">
        {section.icon}
        <span className="font-semibold text-(--color-neutral)">{section.title}</span>
      </span>
      {isOpen ? (
        <FaChevronUp className="text-(--color-secondary) shrink-0" />
      ) : (
        <FaChevronDown className="text-(--color-secondary) shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="px-6 py-4 bg-white border-t border-(--color-base-300)">
        <ul className="space-y-2">
          {section.content.map((item, i) => (
            <li key={i} className="flex gap-2 text-(--color-secondary) text-sm leading-relaxed">
              <span className="text-(--color-primary) mt-1 shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const PrivacyPolicy = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="bg-(--color-base-100)">

      {/* Hero */}
      <section className="relative h-[45vh] flex items-center justify-center bg-[url('/commonBG.avif')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6">
          <FaShieldAlt className="text-5xl text-(--color-primary) mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Privacy <span className="text-(--color-primary)">Policy</span>
          </h1>
          <p className="text-white/75 text-base max-w-xl mx-auto">
            We value your privacy. Learn how Cravings collects, uses, and protects your personal information.
          </p>
          <p className="text-white/50 text-sm mt-3">Last updated: April 9, 2026</p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-(--color-secondary) leading-relaxed text-base">
          This Privacy Policy describes how <strong className="text-(--color-neutral)">Cravings</strong> ("we", "us", or "our") collects, uses, and shares
          information about you when you use our website, mobile application, and related services.
          By using Cravings, you agree to the practices described in this policy.
        </p>
      </section>

      {/* Accordion Sections */}
      <section className="max-w-3xl mx-auto px-6 pb-12 space-y-3">
        {SECTIONS.map((section, i) => (
          <AccordionItem
            key={i}
            section={section}
            isOpen={openIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </section>

      {/* Contact */}
      <section className="bg-(--color-primary) py-12 px-6 text-center">
        <FaEnvelope className="text-3xl text-(--color-neutral-content) mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-(--color-neutral-content) mb-2">Questions about your privacy?</h2>
        <p className="text-(--color-neutral-content)/70 mb-4 text-sm max-w-md mx-auto">
          Reach out to our Data Protection team and we'll respond within 2 business days.
        </p>
        <a
          href="mailto:contact@cravings.com"
          className="inline-block bg-(--color-primary) text-white font-semibold px-6 py-2 rounded-full hover:opacity-90 transition-opacity text-sm"
        >
          contact@cravings.com
        </a>
      </section>

    </div>
  );
};

export default PrivacyPolicy;
