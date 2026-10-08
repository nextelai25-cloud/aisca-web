// Starting positions for the five businesses. SERVER ONLY (imported by engine.ts).
// Every business starts losing a little money each week, at a similar size and value,
// so all five compete fairly on one leaderboard.

import type { BizId } from './types'

export interface Start {
  cash: number
  debt: number
  assets: number
  customers: number
  capacity: number
  market: number
  refPrice: number
  elasticity: number
  price: number
  margin: number
  fixed: number
  brand: number
  quality: number
  morale: number
  efficiency: number
}

export const START: Record<BizId, Start> = {
  cafe: {
    cash: 2_600_000, debt: 2_500_000, assets: 2_400_000,
    customers: 760, capacity: 1700, market: 1750,
    refPrice: 1100, elasticity: 0.9, price: 1100, margin: 0.42, fixed: 380_000,
    brand: 42, quality: 58, morale: 44, efficiency: 46,
  },
  restaurant: {
    cash: 2_300_000, debt: 1_800_000, assets: 2_800_000,
    customers: 1100, capacity: 2400, market: 2500,
    refPrice: 850, elasticity: 1.0, price: 850, margin: 0.38, fixed: 400_000,
    brand: 40, quality: 62, morale: 50, efficiency: 48,
  },
  tech: {
    cash: 2_600_000, debt: 1_000_000, assets: 1_400_000,
    customers: 230, capacity: 520, market: 450,
    refPrice: 4400, elasticity: 0.6, price: 4400, margin: 0.45, fixed: 510_000,
    brand: 50, quality: 66, morale: 38, efficiency: 52,
  },
  fashion: {
    cash: 1_800_000, debt: 2_200_000, assets: 4_300_000,
    customers: 340, capacity: 900, market: 750,
    refPrice: 3300, elasticity: 1.25, price: 3300, margin: 0.40, fixed: 490_000,
    brand: 48, quality: 50, morale: 52, efficiency: 44,
  },
  hotel: {
    cash: 2_400_000, debt: 6_000_000, assets: 9_100_000,
    customers: 49, capacity: 140, market: 124,
    refPrice: 18500, elasticity: 0.8, price: 18500, margin: 0.50, fixed: 500_000,
    brand: 38, quality: 55, morale: 50, efficiency: 48,
  },
}

export const BRIEFINGS: Record<BizId, { story: string[]; problem: string; priceLabel: string }> = {
  cafe: {
    priceLabel: 'Average bill',
    story: [
      'Brew Lane opened eight years ago on a quiet lane in Colombo 07.',
      'For years, it was the place. Students, writers, first dates.',
      'Then a global coffee chain opened 200 metres away.',
      'Footfall is down 40%. Two baristas have already left.',
      'The owner is tired. She just handed you the keys.',
    ],
    problem: 'You are losing money every week, rent is LKR 1.2 million a month, and your team has stopped believing.',
  },
  restaurant: {
    priceLabel: 'Average bill per diner',
    story: [
      "Amma's Kitchen has served rice and curry in Kandy for 22 years.",
      'The food is still excellent. The dining hall is still half empty.',
      'Young people order on delivery apps now. Tourists never find it.',
      'The menu, the chairs and the signboard have not changed since 2004.',
      'The family has asked you to run it. Amma is watching.',
    ],
    problem: 'Loyal regulars are getting older, young customers never come in, and costs keep rising.',
  },
  tech: {
    priceLabel: 'Rate per billable hour',
    story: [
      'Nexora builds software for banks and retailers from an office in Colombo 03.',
      'Last month its biggest client, 40% of all work, moved to a cheaper firm.',
      'Three senior engineers have offers from companies abroad.',
      'Eighteen people still come in every day, waiting to see what happens.',
      'The founders have made you CEO. The board meets in a year.',
    ],
    problem: 'Salaries are fixed, the work is not, and every week without new clients burns cash.',
  },
  fashion: {
    priceLabel: 'Average order',
    story: [
      'Thread & Co. makes everyday clothing in Sri Lanka and sells it in two mall stores.',
      'Three years ago, the queue went out the door.',
      'Now Instagram brands sell similar designs for less, and deliver to your door.',
      "Last season's stock is still on the racks. Mall rent is due on the 1st.",
      'The founder is out. You are in.',
    ],
    problem: 'Too much old stock, too few new customers, and a brand people have stopped talking about.',
  },
  hotel: {
    priceLabel: 'Average room rate per night',
    story: [
      'Ella Ridge has 20 rooms and one of the best views in the hill country.',
      'On most nights, 13 of those rooms are empty.',
      'The online reviews mention leaking taps, slow Wi-Fi and a tired lobby.',
      'Tourists are coming back to Sri Lanka, but they are booking the places next door.',
      'The bank holds a LKR 6 million loan on the building. You have one year.',
    ],
    problem: 'Low occupancy, a heavy loan, and reviews that send guests to your competitors.',
  },
}
