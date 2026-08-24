import React, { useEffect, useMemo, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const SLIDES = [
  {
    type: "video",
    source: `${import.meta.env.BASE_URL}cravings-showcase.mp4`,
    duration: 8000,
    title: "Signature feasts",
    subtitle: "Slow panning visuals that keep the focus on flavor.",
  },
  {
    type: "video",
    source: `${import.meta.env.BASE_URL}cravings-video-2.mp4`,
    duration: 12000,
    title: "Street food energy",
    subtitle: "Warm, fast, and packed with everyday cravings.",
  },
  {
    type: "video",
    source: `${import.meta.env.BASE_URL}cravings-video-3.mp4`,
    duration: 8000,
    title: "Family dinner mood",
    subtitle: "Rich colors and inviting close-ups for comfort meals.",
  },
  {
    type: "video",
    source: `${import.meta.env.BASE_URL}cravings-video-4.mp4`,
    duration: 12000,
    title: "Fresh and vibrant",
    subtitle: "Greens, textures, and soft motion for lighter picks.",
  },
  {
    type: "video",
    source: `${import.meta.env.BASE_URL}cravings-video-5.mp4`,
    duration: 12000,
    title: "Dessert spotlight",
    subtitle: "A sweeter frame for bakery and after-meal cravings.",
  },
];

const CarouselComponent = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoPlay || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDES[currentSlide]?.duration || 5000);

    return () => clearInterval(interval);
  }, [autoPlay, currentSlide, prefersReducedMotion]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setAutoPlay(false);
  };

  const activeSlide = SLIDES[currentSlide];

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/30 shadow-[0_30px_80px_rgba(15,23,42,0.35)]"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(244,114,182,0.18),transparent_25%),linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.46))]" />

      <div key={currentSlide} className="absolute inset-0 cravings-media-reveal">
        {activeSlide.type === "video" ? (
          <video
            src={activeSlide.source}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Cravings food showcase"
          />
        ) : (
          <img
            src={activeSlide.source}
            alt={`Slide ${currentSlide + 1}`}
            className="h-full w-full object-cover"
            decoding="async"
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />

      <div className="pointer-events-none absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md sm:left-5 sm:top-5">
        <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_0_4px_rgba(251,146,60,0.18)]" />
        Featured carousel
      </div>

      <div className="pointer-events-none absolute bottom-5 left-4 right-4 z-20 flex flex-col gap-3 sm:left-5 sm:right-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl rounded-[1.5rem] border border-white/15 bg-black/35 p-4 text-white backdrop-blur-md sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-200">
            {SLIDES[currentSlide]?.title}
          </p>
          <h3 className="mt-1 text-xl font-black leading-tight sm:text-2xl">
            Turn every scroll into a craving.
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/78">
            {SLIDES[currentSlide]?.subtitle}
          </p>
        </div>

        <div className="pointer-events-auto flex items-center gap-3 self-start rounded-full border border-white/15 bg-black/30 px-4 py-3 text-white backdrop-blur-lg">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <span className="hidden text-xs font-semibold text-white/70 sm:inline">
            {String(currentSlide + 1).padStart(2, "0")}/{String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Previous Button */}
      <button
        type="button"
        onClick={prevSlide}
        className="pointer-events-auto absolute left-4 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/30 active:scale-95"
        aria-label="Previous slide"
        title="Previous slide"
      >
        <IoChevronBack size={27} />
      </button>

      {/* Next Button */}
      <button
        type="button"
        onClick={nextSlide}
        className="pointer-events-auto absolute right-4 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/30 active:scale-95"
        aria-label="Next slide"
        title="Next slide"
      >
        <IoChevronForward size={27} />
      </button>
    </div>
  );
};

export default CarouselComponent;
