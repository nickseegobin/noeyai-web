'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeroPanel from '@/components/ui/HeroPanel';
import BrandHeader from '@/components/ui/BrandHeader';
import { SliderMessage, SiteSettings } from '@/lib/wp';
import BrandLogo from '@/components/ui/BrandLogo';

interface Props {
  messages: SliderMessage[];
  site: SiteSettings;
}

export default function LandingPage({ messages, site }: Props) {
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
  const tagline  = site.tagline || "You Always Knew They Could.\nNow You'll Know They Are.";

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">

      {/* ── LEFT: coral hero panel ── */}
     <div className="flex flex-col md:w-[58%]">
        <HeroPanel messages={messages} site={site} />
    </div>

      {/* ── RIGHT: cream CTA panel ── */}
      <div className="flex flex-col items-center justify-center bg-noey-bg md:w-[42%] px-8 py-12">
        {/* RIGHT panel inner container — was max-w-[280px] */}
<div className="w-full max-w-sm flex flex-col items-center">

   
     <BrandHeader
    logoUrl={site.logo_url}
    variant="coral"
    className="hidden md:block w-80 mb-10"
    />

  {/* Login */}
  <Link
    href="/login"
    className="block w-full text-center font-sans font-semibold text-white bg-noey-primary rounded-2xl py-4 mb-3 hover:opacity-90 active:scale-[0.98] transition-all"
  >
    Login
  </Link>

  {/* Sign up */}
  <Link
    href="/register"
    className="block w-full text-center font-sans font-semibold text-noey-text bg-noey-neutral rounded-2xl py-4 hover:opacity-90 active:scale-[0.98] transition-all"
  >
    Sign up
  </Link>

  {/* efoundry credit */}
  <div className="flex items-center gap-2 mt-16">
    <span className="font-sans text-xs text-noey-text-muted">
      Created with love and care by
    </span>
    {site.efoundry_url ? (
      <img
        src={site.efoundry_url}
        alt="efoundry"
        className="h-5 object-contain"
      />
    ) : (
      <span className="font-sans text-xs font-medium text-noey-text">efoundry</span>
    )}
  </div>

</div>
      </div>
    </div>
  );
}