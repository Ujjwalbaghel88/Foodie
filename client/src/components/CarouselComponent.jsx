import React, { useState, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import bgImage1 from "../assets/carousel/bgImage1.jpg";
import bgImage2 from "../assets/carousel/bgImage2.jpg";
import bgImage3 from "../assets/carousel/bgImage3.jpg";
import bgImage4 from "../assets/carousel/bgImage4.jpg";

const CarouselComponent = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const slides = [
    { type: "video", source: `${import.meta.env.BASE_URL}cravings-showcase.mp4`, duration: 8000 },

    { type: "video", source: `${import.meta.env.BASE_URL}cravings-video-2.mp4`, duration: 12000 },
    { type: "video", source: `${import.meta.env.BASE_URL}cravings-video-3.mp4`, duration: 12000 },
    { type: "video", source: `${import.meta.env.BASE_URL}cravings-video-4.mp4`, duration: 12000 },
    { type: "video", source: `${import.meta.env.BASE_URL}cravings-video-5.mp4`, duration: 12000 },
    // { type: "image", source: bgImage1, duration: 5000 },
    // { type: "image", source: bgImage2, duration: 5000 },
    // { type: "image", source: bgImage3, duration: 5000 },
    // { type: "image", source: bgImage4, duration: 5000 },
  ];

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, slides[currentSlide]?.duration || 5000);

    return () => clearInterval(interval);
  }, [autoPlay, currentSlide, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Carousel Slides */}
      {slides.map((slide, index) => (
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
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition z-10 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <IoChevronBack size={24} />
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition z-10 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <IoChevronForward size={24} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
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
