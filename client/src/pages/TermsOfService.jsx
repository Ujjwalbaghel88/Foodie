import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFileContract,
  FaUserCheck,
  FaShoppingCart,
  FaMotorcycle,
  FaStore,
  FaBan,
  FaBalanceScale,
  FaTimesCircle,
  FaEnvelope,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const TERMS = [
  {
    icon: <FaUserCheck className="text-xl text-(--color-primary)" />,
    title: "1. User Accounts",
    content: [
      "You must be at least 18 years old to create a Cravings account.",
      "You are responsible for maintaining the confidentiality of your login credentials.",
      "You agree to provide accurate, current, and complete information during registration.",
      "Cravings reserves the right to suspend or terminate accounts that violate these terms.",
      "One person may not operate multiple accounts without prior written consent from Cravings.",
    ],
  },
  {
    icon: <FaShoppingCart className="text-xl text-(--color-primary)" />,
    title: "2. Orders & Payments",
    content: [
      "All prices displayed are inclusive of applicable taxes unless stated otherwise.",
      "Orders are confirmed only after successful payment authorisation.",
      "You may cancel an order within 2 minutes of placing it; after that, cancellations are subject to the restaurant's policy.",
      "Refunds for failed or incomplete deliveries are processed within 3–5 business days.",
      "Cravings is not liable for pricing errors caused by third-party restaurants.",
    ],
  },
  {
    icon: <FaMotorcycle className="text-xl text-(--color-primary)" />,
    title: "3. Rider Terms",
    content: [
      "Riders must hold a valid driving licence and comply with all local traffic laws.",
      "Riders are independent contractors and not employees of Cravings.",
      "Earnings are calculated per delivery and disbursed weekly to the registered bank account.",
      "Fraudulent delivery claims may result in immediate account termination.",
      "Riders must maintain a minimum rating of 3.5 stars to remain active on the platform.",
    ],
  },
  {
    icon: <FaStore className="text-xl text-(--color-primary)" />,
    title: "4. Restaurant Partners",
    content: [
      "Restaurants must ensure menu information, pricing, and availability are kept up to date.",
      "All listed food items must comply with local food safety and hygiene regulations.",
      "Cravings charges a commission on each completed order as per the agreed partnership contract.",
      "Restaurants are responsible for packaging orders securely to maintain food quality.",
      "Persistent poor ratings or hygiene complaints may result in removal from the platform.",
    ],
  },
  {
    icon: <FaBan className="text-xl text-(--color-primary)" />,
    title: "5. Prohibited Conduct",
    content: [
      "Attempting to reverse-engineer, scrape, or copy any part of the Cravings platform.",
      "Posting false reviews or manipulating the rating system.",
      "Using the platform to transmit spam, malware, or harmful content.",
      "Impersonating other users, restaurants, or Cravings staff.",
      "Engaging in fraudulent transactions or chargebacks without legitimate cause.",
    ],
  },
  {
    icon: <FaBalanceScale className="text-xl text-(--color-primary)" />,
    title: "6. Limitation of Liability",
    content: [
      "Cravings is a marketplace connecting customers, restaurants, and riders. We are not the food provider.",
      "We are not liable for food quality, allergen information, or preparation standards of partner restaurants.",
      "Our total liability for any claim is limited to the value of the order in question.",
      "We are not responsible for delays caused by circumstances beyond our control (e.g. traffic, weather).",
      "Users assume responsibility for verifying allergen and dietary information with restaurants directly.",
    ],
  },
  {
    icon: <FaTimesCircle className="text-xl text-(--color-primary)" />,
    title: "7. Termination",
    content: [
      "You may close your account at any time via dashboard → Settings.",
      "Cravings may suspend or terminate accounts that breach these terms without prior notice.",
      "Upon termination, your right to use the platform ceases immediately.",
      "Outstanding payments or obligations remain enforceable after termination.",
      "Cravings may retain certain data post-termination as required by law.",
    ],
  },
];

const AccordionItem = ({ term, isOpen, onToggle }) => (
  <div className="border border-(--color-base-300) rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left bg-(--color-base-100) hover:bg-(--color-base-200) transition-colors"
    >
      <span className="flex items-center gap-3">
        {term.icon}
        <span className="font-semibold text-(--color-neutral)">
          {term.title}
        </span>
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
          {term.content.map((item, i) => (
            <li
              key={i}
              className="flex gap-2 text-(--color-secondary) text-sm leading-relaxed"
            >
              <span className="text-(--color-primary) mt-1 shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const TermsOfService = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="bg-(--color-base-100)">
      {/* Hero */}
      <section className="relative h-[45vh] flex items-center justify-center bg-[url('/commonBG.avif')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6">
          <FaFileContract className="text-5xl text-(--color-primary) mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Terms of <span className="text-(--color-primary)">Service</span>
          </h1>
          <p className="text-white/75 text-base max-w-xl mx-auto">
            Please read these terms carefully before using the Cravings
            platform.
          </p>
          <p className="text-white/50 text-sm mt-3">
            Last updated: April 9, 2026
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-(--color-secondary) leading-relaxed text-base">
          These Terms of Service ("Terms") govern your access to and use of the{" "}
          <strong className="text-(--color-neutral)">Cravings</strong> platform,
          including our website and mobile applications. By creating an account
          or placing an order, you agree to be bound by these Terms. If you do
          not agree, please do not use our services.
        </p>
      </section>

      {/* Accordion */}
      <section className="max-w-3xl mx-auto px-6 pb-12 space-y-3">
        {TERMS.map((term, i) => (
          <AccordionItem
            key={i}
            term={term}
            isOpen={openIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </section>

      {/* Privacy link */}
      <section className="max-w-3xl mx-auto px-6 pb-12 text-center">
        <p className="text-(--color-secondary) text-sm">
          Your use of Cravings is also governed by our{" "}
          <Link
            to="/privacy-policy"
            className="text-(--color-primary) hover:underline font-medium"
          >
            Privacy Policy
          </Link>
          , which is incorporated into these Terms by reference.
        </p>
      </section>

      {/* Contact CTA */}
      <section className="bg-(--color-primary) py-12 px-6 text-center">
        <FaEnvelope className="text-3xl text-(--color-neutral-content) mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-(--color-neutral-content) mb-2">
          Have questions about our Terms?
        </h2>
        <p className="text-(--color-neutral-content)/70 mb-4 text-sm max-w-md mx-auto">
          Our legal team is happy to help. Send us an email and we'll get back
          to you within 2 business days.
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

export default TermsOfService;
