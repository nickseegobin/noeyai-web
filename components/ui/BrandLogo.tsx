interface Props {
  variant?: 'coral' | 'dark' | 'white';
  className?: string;
}

export default function BrandLogo({ variant = 'coral', className = 'w-48' }: Props) {
  const src =
    variant === 'white' ? '/logos/logo_light.svg' :
    variant === 'dark'  ? '/logos/logo_dark.svg'  :
                          '/logos/logo_color.svg';

  return (
    <img
      src={src}
      alt="NoeyAI"
      className={className}
    />
  );
}