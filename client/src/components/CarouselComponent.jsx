import React, { useState, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const SLIDES = [
  { type: "video", source: `${import.meta.env.BASE_URL}cravings-showcase.mp4`, duration: 8000 },
  { type: "video", source: `${import.meta.env.BASE_URL}cravings-video-2.mp4`, duration: 12000 },
  { type: "video", source: `${import.meta.env.BASE_URL}cravings-video-3.mp4`, duration: 8000 },
  { type: "video", source: `${import.meta.env.BASE_URL}cravings-video-4.mp4`, duration: 12000 },
  { type: "video", source: `${import.meta.env.BASE_URL}cravings-video-5.mp4`, duration: 12000 },
];

const CarouselComponent = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDES[currentSlide]?.duration || 5000);

    return () => clearInterval(interval);
  }, [autoPlay, currentSlide]);

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

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Carousel Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {slide.type === "video" ? (
            <video src={slide.source} className="h-full w-full object-cover" autoPlay muted loop playsInline aria-label="Cravings food showcase" />
          ) : (
            <img src={slide.source} alt={`Slide ${index + 1}`} className="h-full w-full object-cover" />
          )}
        </div>
      ))}

      {/* Previous Button */}
      <button
        type="button"
        onClick={prevSlide}
        className="pointer-events-auto absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/35 text-white shadow-lg backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/30 active:scale-95"
        aria-label="Previous slide"
        title="Previous slide"
      >
        <IoChevronBack size={27} />
      </button>

      {/* Next Button */}
      <button
        type="button"
        onClick={nextSlide}
        className="pointer-events-auto absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/35 text-white shadow-lg backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/30 active:scale-95"
        aria-label="Next slide"
        title="Next slide"
      >
        <IoChevronForward size={27} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselComponent;
