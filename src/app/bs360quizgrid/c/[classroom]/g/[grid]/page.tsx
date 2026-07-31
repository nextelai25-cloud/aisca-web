import { notFound } from 'next/navigation';
import { getGrid } from '@/data/bs360-grids';
import QuizBoardClient from './QuizBoardClient';

export default async function GridPage({
  params,
}: {
  params: Promise<{ classroom: string; grid: string }>;
}) {
  const { classroom: classroomParam, grid: gridParam } = await params;
  const classroom = Number(classroomParam);
  const gridId = Number(gridParam);

  if (!Number.isInteger(classroom) || classroom < 1 || classroom > 8) notFound();
  if (!Number.isInteger(gridId) || gridId < 0 || gridId > 6) notFound();

  const grid = getGrid(gridId);
  if (!grid) notFound();

  return <QuizBoardClient key={`c${classroom}-g${gridId}`} classroom={classroom} grid={grid} />;
}
