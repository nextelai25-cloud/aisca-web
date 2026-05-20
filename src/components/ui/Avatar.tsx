import Image from 'next/image';

export interface AvatarProps {
  src?: string;
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, initials, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-12 h-12 text-[14px]",
    lg: "w-16 h-16 text-[18px]",
  };

  return (
    <div className={`relative shrink-0 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center overflow-hidden ${sizes[size]} ${className}`}>
      {src ? (
        <Image src={src} alt={initials} fill className="object-cover" sizes="64px" />
      ) : (
        <span className="font-display font-bold text-white/80">{initials}</span>
      )}
    </div>
  );
}
