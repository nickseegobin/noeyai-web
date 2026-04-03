'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { SliderMessage, SiteSettings } from '@/lib/wp';

interface Props {
  messages: SliderMessage[];
  site: SiteSettings;
}

export default function HeroPanel({ messages, site }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const slide    = messages[current] ?? { header: '', copy: '', image: '' };
  const imageUrl = slide.image || '/illustrations/noey-character.png';

  return (
    <div className="flex flex-col items-center bg-noey-primary w-full md:min-h-dvh px-8 pt-8 pb-10">

      {/* Logo — white on coral */}
      <div className="w-full mb-6">
        {site.logo_url ? (
          <img src={site.logo_url} alt="NoeyAI" className="h-9 brightness-0 invert" />
        ) : (
          <span className="font-display italic font-semibold text-2xl text-white">noeyAi</span>
        )}
      </div>

      {/* Character illustration */}
      <div className="relative w-64 h-64 md:w-72 md:h-72 flex-shrink-0">
        <Image
          src={imageUrl}
          alt="NoeyAI character"
          fill
          sizes="(max-width: 768px) 256px, 288px"
          className="object-contain"
          priority
        />
      </div>

      {/* Slide text */}
      <div key={current} className="text-center mt-6 max-w-sm animate-fade-in">
        <h1 className="font-display italic font-semibold text-white text-2xl md:text-[1.75rem] leading-snug mb-3">
          {slide.header}
        </h1>
        <p className="font-sans text-white/80 text-sm md:text-[0.95rem] leading-relaxed">
          {slide.copy}
        </p>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2 mt-8">
        {messages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-5 h-3 bg-white'
                : 'w-3 h-3 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}