export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase transition-colors";
  
  const variants = {
    default: "bg-white/[0.04] text-zinc-400 border border-white/[0.06]",
    outline: "bg-transparent text-zinc-500 border border-white/[0.1]",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
