import { getSliderMessages, getSiteSettings } from '@/lib/wp';
import HeroPanel from '@/components/ui/HeroPanel';
import ChildSignUpForm from '@/components/ui/ChildSignUpForm';

export default async function ChildRegisterPage() {
  const [messages, site] = await Promise.all([
    getSliderMessages(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">

      {/* Coral panel — desktop only */}
      <div className="hidden md:flex md:w-[58%]">
        <HeroPanel messages={messages} site={site} />
      </div>

      {/* Form — full width mobile, right panel desktop */}
      <div className="flex-1 md:w-[42%] overflow-y-auto">
        <ChildSignUpForm site={site} />
      </div>

    </div>
  );
}