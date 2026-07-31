'use client';

// Deprecated: the single shared-password gate has been replaced by
// per-classroom gates (see ClassroomGate.tsx). Kept as a harmless
// pass-through so any stray import still compiles.
export default function Bs360Gate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
