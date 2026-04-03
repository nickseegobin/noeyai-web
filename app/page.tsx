/* "use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const SLIDES = [
  { headline: "The Caribbean's first AI focused platform for education.", body: "Uses artificial intelligence to generate unlimited, curriculum-aligned multiple choice practice exams for primary school students in Trinidad and Tobago." },
  { headline: "Unlimited practice. Zero repetition.", body: "Every exam is unique — drawn from a growing pool or generated fresh by AI, grounded in the official Ministry of Education curriculum." },
  { headline: "Built for SEA preparation.", body: "Designed specifically for Standard 4 and Standard 5 students preparing for Trinidad and Tobago's Secondary Entrance Assessment." },
  { headline: "Track progress. Celebrate growth.", body: "AI coaching notes after every exam, weekly performance summaries, and detailed topic breakdowns help students improve faster." },
];

export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!loading && user) router.replace("/profile-select"); }, [user, loading, router]);
  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  if (loading) return null;

  return (
    <div className="page-container">
      <div className="flex items-center gap-2 mb-8">
        <HamIcon /><span className="font-black text-xl text-noey-text">NoeyAI</span>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-noey-card-dark rounded-3xl p-7 min-h-[320px] flex flex-col justify-end">
          <h1 className="text-white font-black text-3xl leading-tight mb-4">{SLIDES[current].headline}</h1>
          <p className="text-white/70 text-sm leading-relaxed font-medium">{SLIDES[current].body}</p>
        </div>
        <div className="flex items-center justify-center gap-2.5 mt-5 mb-8">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 w-3 h-3 ${i === current ? "bg-noey-text" : "bg-noey-text/25"}`} />
          ))}
        </div>
        <div className="flex flex-col gap-3 mt-auto">
          <Link href="/login" className="noey-btn-primary text-center block">Login</Link>
          <Link href="/register" className="noey-btn-secondary text-center block">Sign Up</Link>
          <div className="flex justify-center mt-1">
            <a href="http://noeyai.local/wp-login.php?action=lostpassword" target="_blank" rel="noopener noreferrer" className="text-noey-text-muted text-sm font-medium">Forgot Password?</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function HamIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <rect width="22" height="2.5" rx="1.25" fill="#111114" />
      <rect y="6.75" width="22" height="2.5" rx="1.25" fill="#111114" />
      <rect y="13.5" width="22" height="2.5" rx="1.25" fill="#111114" />
    </svg>
  );
}
 */

import { getSliderMessages, getSiteSettings } from '@/lib/wp';
import LandingPage from '@/components/ui/LandingPage';

export default async function Home() {
  const [messages, site] = await Promise.all([
    getSliderMessages(),
    getSiteSettings(),
  ]);

  return <LandingPage messages={messages} site={site} />;
}