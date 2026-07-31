import { notFound } from 'next/navigation';
import ClassroomGate from '../../ClassroomGate';

// Every page under /bs360quizgrid/c/[classroom] (grid list + boards) sits
// behind this classroom's own password. Knowing one classroom's password
// never unlocks another.
export default async function ClassroomGatedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ classroom: string }>;
}) {
  const { classroom } = await params;
  const n = Number(classroom);
  if (!Number.isInteger(n) || n < 1 || n > 8) notFound();

  return <ClassroomGate classroom={n}>{children}</ClassroomGate>;
}
