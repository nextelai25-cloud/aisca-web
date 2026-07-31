/**
 * BS360 — school teams assigned to each classroom.
 *
 * Competition happens ONLY inside a classroom (round-robin: everyone plays
 * everyone). "A" / "B" after a school name means Team A / Team B of that school.
 *
 * Each grid inside a classroom hosts ONE match between two of these teams.
 *   3 teams  -> 3 matchups needed  (uses 3 grids)
 *   4 teams  -> 6 matchups needed  (uses 6 grids)
 * We never hard-limit grids — ties can force replays — but the winner of a
 * classroom is the team with the most match wins.
 */

export const CLASSROOM_TEAMS: Record<number, string[]> = {
  1: [
    'Rathnavali Balika Vidyalaya B',
    'Bishops College A',
    'Visakha Vidyalaya B',
    'Vidura College B',
  ],
  2: [
    'Musaeus College A',
    'Defence Services College A',
    'Ananda College B',
    'Bishops College B',
  ],
  3: [
    'D.S.Senanayake College B',
    'St. Josephs College Maradana A',
    'Bandaranayake Central Veyangoda A',
    'Gampaha Bandaranayake B',
  ],
  4: [
    'St. John’s College Jaffna A',
    'Muslim Ladies College A',
    'Sripalee College A',
    'Anula Vidyalaya A',
  ],
  5: [
    'Vidura College A',
    'Panadura Balika Vidyalaya A',
    'Ananda College A',
    'Royal Institute Havelock A',
  ],
  6: [
    'Gampaha Bandaranayake A',
    'Mahanama College A',
    'Anula Vidyalaya B',
  ],
  7: [
    'Musaeus College B',
    'Convent of Our Lady of Victories A',
    'Methodist College A',
    'Wesley College B',
  ],
  8: [
    'Muslim Ladies College B',
    'D.S.Senanayake A',
    'Ferguson High School A',
  ],
};

export function teamsForClassroom(classroom: number): string[] {
  return CLASSROOM_TEAMS[classroom] ?? [];
}

/** Number of round-robin matchups needed for a classroom's team count. */
export function requiredMatchups(classroom: number): number {
  const n = teamsForClassroom(classroom).length;
  return (n * (n - 1)) / 2;
}
