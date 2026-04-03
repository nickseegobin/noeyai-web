import Image from 'next/image';

interface Props {
  image:       string;
  title:       string;
  description: string;
}

export default function AppLeftPanel({ image, title, description }: Props) {
  return (
    <div className="hidden md:flex flex-col items-center justify-center bg-noey-neutral w-[38%] flex-shrink-0 px-10 py-12">
      <div className="relative w-72 h-72 mb-6">
        <Image
          src={image}
          alt={title}
          fill
          sizes="288px"
          className="object-contain"
          priority
        />
      </div>
      <h2 className="font-display italic font-semibold text-noey-dark text-3xl text-center leading-snug mb-3">
        {title}
      </h2>
      <p className="font-sans text-noey-text-muted text-sm text-center leading-relaxed">
        {description}
      </p>
    </div>
  );
}