import BrandLogo from '@/components/ui/BrandLogo';

interface Props {
  logoUrl:   string | null;
  tagline?:  string | null;
  variant?:  'coral' | 'dark' | 'white';
  className?: string;
}

export default function BrandHeader({ logoUrl, tagline, variant = 'coral', className = 'w-80' }: Props) {
  return (
    <div className="flex flex-col items-center">
      <BrandLogo variant="coral" className="w-80 mb-3" />
      {tagline && (
        <p className="font-sans text-noey-text-muted text-center text-[0.95rem] leading-relaxed whitespace-pre-line mt-1">
          {tagline}
        </p>
      )}
    </div>
  );
}