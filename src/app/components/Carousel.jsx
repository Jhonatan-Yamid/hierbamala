"use client";
import { useEffect, useRef, useState } from 'react';

const Carousel = () => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesContent = [
    {
      title: "Prueba nuestros deliciosos",
      buttonText: "Nuestro Menú",
      imageSrc: "Chicharron.jpg",
      subtitle: "Asados al Carbon desde $16.000"
    },
    // {
    //   title: "Your bond where it must be:",
    //   buttonText: "Book now",
    //   imageSrc: "Banner_1.jpg",
    //   subtitle: "In your bank account!"
    // },
    // {
    //   title: "This could be you, while",
    //   buttonText: "Book now",
    //   imageSrc: "Banner_1.jpg",
    //   subtitle: "We clean your place"
    // }
  ];
  const totalSlides = slidesContent.length;

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="carousel relative" ref={carouselRef}>
      {slidesContent.map((slide, index) => (
        <div key={index} className="slide" style={{ display: index === currentIndex ? 'block' : 'none' }}>
          <div className="relative">
          <div className="fade-overlay-sup"></div> 
            <img src={slide.imageSrc} alt="" className="w-full" />
            <div className="fade-overlay"></div>
            <div className="absolute top-[60%] left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-start w-2/4 md:w-2/6 sm:max-w-lg mx-auto">
              <div className="p-8 rounded-lg text-white">
                <h1 className="text-sm md:text-4xl mb-4 md:mb-8">{slide.title} <div className="font-bold">{slide.subtitle}</div></h1>
                <a href="#book" className="border-2 cursor-pointer text-white font-semibold px-2 md:px-6 py-1 md:py-3 rounded-xl hover:bg-sky-900 transition duration-300 text-xs md:text-xl">
                  {slide.buttonText}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button onClick={prevSlide} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2">
        &lt;
      </button>
      <button onClick={nextSlide} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2">
        &gt;
      </button>
    </div>
  );
};

export default Carousel;

