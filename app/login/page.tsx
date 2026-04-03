import { getSliderMessages, getSiteSettings } from '@/lib/wp';
import HeroPanel from '@/components/ui/HeroPanel';
import LoginForm from '@/components/ui/LoginForm';

export default async function LoginPage() {
  const [messages, site] = await Promise.all([
    getSliderMessages(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">

      {/* Coral panel — desktop only, completely hidden on mobile */}
      <div className="hidden md:flex md:w-[58%]">
        <HeroPanel messages={messages} site={site} />
      </div>

      {/* Login form — full screen on mobile, right panel on desktop */}
      <div className="flex-1 md:w-[42%]">
        <LoginForm site={site} />
      </div>

    </div>
  );
}