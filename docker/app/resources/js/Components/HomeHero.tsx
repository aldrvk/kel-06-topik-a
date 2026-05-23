import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import bgHero from '../../images/backgrounds/dummyBackground.png';
import bgGradient from '../../images/gradients/HomeHeroGradient.png';

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Add a slight delay to ensure the mount animation feels smooth and intentional
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Slow Zoom-Out Entrance */}
      <img
        src={bgHero}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out ${
          isMounted ? 'scale-100' : 'scale-110'
        }`}
        alt="Venus Space Background"
      />

      {/* Existing Image Gradient Overlay */}
      <img
        src={bgGradient}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        alt="Gradient Overlay"
      />

      {/* Modern CSS Gradient Overlays for rich contrast and text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20 z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 z-0" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-20 flex flex-col items-center text-center gap-6 mt-16 md:mt-0">
        
        {/* Top Pill */}
        <div 
          className={`inline-flex items-center gap-2 px-5 py-2.5 border border-border/30 rounded-full bg-surface/20 backdrop-blur-md transition-all duration-1000 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
          <span className="text-label-sm text-foreground tracking-wider">EFISIENSI TANPA KOMPROMI</span>
        </div>

        {/* Main Heading */}
        <h1 
          className={`max-w-4xl transition-all duration-1000 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <span className="text-h1 text-super-black">Satu Titik, </span>
          <br className="md:hidden" />
          <span className="text-h1 text-primary drop-shadow-md">Lima Keseruan.</span>
        </h1>

        {/* Description */}
        <p 
          className={`text-body-l max-w-3xl text-foreground transition-all duration-1000 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          Lebih dari sekadar tempat cuci mobil. Venus Hub dirancang sebagai ruang jeda yang memadukan presisi otomotif dengan kultur lifestyle urban. Nongkrong, main, dan rawat kendaraan dalam satu ekosistem.
        </p>

        {/* Button */}
        <div 
          className={`mt-8 transition-all duration-1000 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <Link 
            href="#" 
            className="group text-h4 text-super-black inline-flex items-center justify-center px-10 py-4 bg-primary rounded-full hover:bg-surface hover:text-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Eksplorasi Layanan
            <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
