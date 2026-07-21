import React from "react";
import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaMotorcycle,
  FaStore,
  FaHeart,
  FaLeaf,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";
import heroBg from "../assets/foodTable.webp";
import circleLogo from "../assets/circleLogo.png";

const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "1,200+", label: "Partner Restaurants" },
  { value: "3,500+", label: "Active Riders" },
  { value: "4.8", label: "Average Rating", icon: <FaStar className="inline text-yellow-400 mb-1" /> },
];

const VALUES = [
  {
    icon: <FaHeart className="text-3xl text-(--color-primary)" />,
    title: "Passion for Food",
    desc: "We believe great food brings people together. Every order is crafted with care.",
  },
  {
    icon: <FaLeaf className="text-3xl text-(--color-primary)" />,
    title: "Fresh & Local",
    desc: "We partner with local restaurants to bring you the freshest meals from your neighborhood.",
  },
  {
    icon: <FaShieldAlt className="text-3xl text-(--color-primary)" />,
    title: "Safe & Reliable",
    desc: "Secure payments, real-time tracking, and verified riders — every single delivery.",
  },
];

const TEAM = [
  { name: "Sofia Reyes", role: "CEO & Co-Founder", initials: "SR" },
  { name: "Marcus Lim", role: "CTO & Co-Founder", initials: "ML" },
  { name: "Aisha Patel", role: "Head of Operations", initials: "AP" },
  { name: "James Owusu", role: "Head of Design", initials: "JO" },
];

const About = () => {
  return (
    <div className="bg-(--color-base-100)">

      {/* Hero */}
      <section
        className="relative h-[60vh] flex items-center justify-center bg-[url('/aboutPage.png')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 text-center px-6">
          <img src={circleLogo} alt="Cravings" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            About <span className="text-(--color-primary)">Cravings</span>
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Connecting hungry hearts with amazing food — one delivery at a time.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-(--color-neutral) py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-(--color-primary)">
                {s.icon} {s.value}
              </p>
              <p className="text-(--color-neutral-content) text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-5xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-(--color-primary) font-semibold uppercase text-sm tracking-widest mb-2">
            Our Story
          </p>
          <h2 className="text-3xl font-bold text-(--color-neutral) mb-4 leading-snug">
            Born from a love of great food
          </h2>
          <p className="text-(--color-secondary) mb-4 leading-relaxed">
            Cravings started in 2022 when three food lovers realized that finding and ordering from local
            restaurants was harder than it needed to be. We set out to build a platform that puts
            restaurants, riders, and customers first — all in one seamless experience.
          </p>
          <p className="text-(--color-secondary) leading-relaxed">
            Today, we operate across dozens of cities, empowering small businesses to reach new
            customers and enabling riders to build a flexible livelihood — all while bringing
            delicious meals straight to your door.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <FaUtensils />, label: "Restaurants", desc: "Diverse cuisines from local gems" },
            { icon: <FaMotorcycle />, label: "Riders", desc: "Fast, reliable delivery partners" },
            { icon: <FaStore />, label: "Partners", desc: "Businesses that grow with us" },
            { icon: <FaHeart />, label: "Community", desc: "People at the heart of everything" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-(--color-base-300) flex flex-col gap-2"
            >
              <span className="text-(--color-primary) text-2xl">{item.icon}</span>
              <p className="font-bold text-(--color-neutral)">{item.label}</p>
              <p className="text-(--color-secondary) text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-(--color-base-200) py-16 px-6">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <p className="text-(--color-primary) font-semibold uppercase text-sm tracking-widest mb-2">
            What We Stand For
          </p>
          <h2 className="text-3xl font-bold text-(--color-neutral)">Our Core Values</h2>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-xl p-8 shadow-sm border border-(--color-base-300) text-center"
            >
              <div className="mb-4 flex justify-center">{v.icon}</div>
              <h3 className="font-bold text-(--color-neutral) text-lg mb-2">{v.title}</h3>
              <p className="text-(--color-secondary) text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet the Team */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="text-center mb-10">
          <p className="text-(--color-primary) font-semibold uppercase text-sm tracking-widest mb-2">
            The People Behind Cravings
          </p>
          <h2 className="text-3xl font-bold text-(--color-neutral)">Meet the Team</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-(--color-primary) flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md">
                {member.initials}
              </div>
              <p className="font-bold text-(--color-neutral)">{member.name}</p>
              <p className="text-(--color-secondary) text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-(--color-primary) py-14 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to satisfy your cravings?</h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          Join thousands of happy customers ordering their favourite meals every day.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-(--color-primary) font-semibold rounded-md hover:bg-orange-100 transition-colors duration-300"
          >
            Get Started
          </Link>
          <Link
            to="/contact"
            className="px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors duration-300"
          >
            Contact Us
          </Link>
        </div>
      </section>

    </div>
  );
};

export default About;
