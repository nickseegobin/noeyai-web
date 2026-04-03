import { getSliderMessages, getSiteSettings } from '@/lib/wp';
import HeroPanel from '@/components/ui/HeroPanel';
import ParentSignUpForm from '@/components/ui/ParentSignUpForm';

export default async function ParentRegisterPage() {
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
        <ParentSignUpForm site={site} />
      </div>

    </div>
  );
}