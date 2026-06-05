export interface EventPhoto {
  src: string
  alt: string
}

export interface Event {
  id: string
  slug: string
  name: string
  tag: string
  year: string
  date: string
  coverPhoto: string
  photos: string[]
  description: string
  note?: string
}

export const events: Event[] = [
  {
    id: '8',
    slug: 'ice-cream-dansela-2026',
    name: 'AISCA Ice Cream Dansela',
    tag: 'Community',
    year: '2026',
    date: 'May 31, 2026',
    coverPhoto: '/events/icecream/photo1.webp',
    photos: [
      '/events/icecream/photo1.webp',
      '/events/icecream/photo2.webp',
      '/events/icecream/photo3.webp'
    ],
    description: `A sweet initiative that brought our community together.. The AISCA Ice Cream Dansela was a heartwarming community project that saw the AISCA family come together to spread joy and sweetness across the community.\n\nTrue to the spirit of giving that defines our association, this initiative was about more than just ice cream — it was about connection, warmth, and the simple joy of making someone's day brighter. \n\nAnother proud moment for the All Island Schools Commerce Association as we continue to make meaningful impact beyond the classroom.`
  },
  {
    id: '7',
    slug: 'aisca-forum-inaugural',
    name: 'AISCA Forum: Inaugural Edition',
    tag: 'Forum',
    year: '2026',
    date: 'May 11, 2026',
    coverPhoto: '/events/forum/5bf50579-0b8a-4428-afaa-e2c822f92596.webp',
    photos: [
      '/events/forum/5bf50579-0b8a-4428-afaa-e2c822f92596.webp',
      '/events/forum/WhatsApp Image 2026-05-20 at 13.59.15.webp'
    ],
    description: `Knowledge, growth, and empowerment.. We are thrilled to look back at the AISCA Forum: Inaugural Edition — a landmark event entirely dedicated to sharpening the minds, breaking the ice, and unlocking the true potential of every individual in the AISCA family.\n\nHosted at the Inspire Business School, the forum was designed to help our members step out of their comfort zones, develop a more confident personal presence, and gain invaluable insights into modern corporate topics.\n\nWe were incredibly honored to have Mr. Salman Faiz, Co-Founder and Managing Director of Inspire Business School, guide us through this journey. We walked out not just inspired, but equipped with a clear vision for our futures!`
  },
  {
    id: '6',
    slug: 'legacy-night-2026',
    name: 'Legacy Night 2026',
    tag: 'Annual Event',
    year: '2026',
    date: 'April 25, 2026',
    coverPhoto: '/events/legacy26/WhatsApp Image 2026-05-20 at 13.58.44.webp',
    photos: [
      '/events/legacy26/WhatsApp Image 2026-05-20 at 13.58.44.webp'
    ],
    description: `The legacy lives on, and it just keeps getting bigger and better.. Following the unforgettable foundation laid in 2025, the 2026 Batch officially took the wheel to host the next version of our signature event: Legacy Night '26.\n\nIn 2026, the energy was dialed up as the new batch curated an incredible night designed for one main purpose — to let loose, have fun, and sharpen the brotherhood and sisterhood across the entire AISCA family. It was the perfect blend of style, music and more fun.\n\nSeeing the '26 batch step up, take ownership, and bring the AISCA family together like this proves that our traditions are in the best possible hands.`,
    note: 'AISCA Representation'
  },
  {
    id: '5',
    slug: 'board-getogether',
    name: 'Board Getogether — Lunch',
    tag: 'Internal',
    year: '2026',
    date: 'April 05, 2026',
    coverPhoto: '/events/boardlunch/WhatsApp Image 2026-05-20 at 13.52.54.webp',
    photos: [
      '/events/boardlunch/WhatsApp Image 2026-05-20 at 13.52.54.webp',
      '/events/boardlunch/WhatsApp Image 2026-05-20 at 13.52.55.webp'
    ],
    description: `Behind every great initiative is a team that functions like family.. To strengthen our internal alignment and celebrate our shared journey, the AISCA Board of Officials stepped away from formal conversations for an informal get-together and lunch.\n\nWhile our day-to-day work involves strategic planning, formal decisions, and coordinating big projects, this day was strictly about letting our hair down, sharing laughs, and strengthening the personal bonds that keep us united as a leadership team.\n\nFrom great food to unforgettable conversations, it was a perfectly relaxed yet deeply memorable day for all of us. When the foundation is strong, the impact is even stronger.`
  },
  {
    id: '4',
    slug: 'shoreline-2025',
    name: 'Shoreline — Beach Cleanup',
    tag: 'Environment',
    year: '2026',
    date: 'February 21, 2026',
    coverPhoto: '/events/shoreline/WhatsApp Image 2026-05-20 at 13.52.31.webp',
    photos: [
      '/events/shoreline/WhatsApp Image 2026-05-20 at 13.52.31.webp',
      '/events/shoreline/WhatsApp Image 2026-05-20 at 13.52.32.webp'
    ],
    description: `Taking action for a cleaner, greener tomorrow.. As the '25 Batch stepped into the next chapter of our AISCA journey, we knew we wanted to mark the transition with an initiative that truly gives back. Enter Shoreline '25 — our first ever beach cleanup drive at Mount Lavinia Beach.\n\nMount Lavinia is one of the island's most iconic tourist destinations, but it also bears the brunt of pollution. Ready to make a tangible difference, AISCA rolled up our sleeves and got to work.\n\nThis event was a phenomenal showcase of unity, bringing the '25 batch, '26 batch, and '27 batch all together. Working side-by-side under the sun, our combined efforts turned the day into a massive success, restoring the natural beauty of the shoreline piece by piece.`
  },
  {
    id: '3',
    slug: 'gift-a-smile',
    name: 'Gift a Smile Campaign',
    tag: 'Community',
    year: '2025',
    date: 'December 24, 2025',
    coverPhoto: '/events/giftasmile/WhatsApp Image 2026-05-20 at 13.52.06.webp',
    photos: [
      '/events/giftasmile/WhatsApp Image 2026-05-20 at 13.52.06.webp',
      '/events/giftasmile/WhatsApp Image 2026-05-20 at 13.52.07 (1).webp',
      '/events/giftasmile/WhatsApp Image 2026-05-20 at 13.52.07.webp'
    ],
    description: `There is no reward greater than the smile on a child's face. Our "Gift a Smile" campaign was a profoundly moving experience for the entire AISCA family as we stepped up to support young students heavily affected by the recent Ditwah cyclone.\n\nWith the sole mission of easing their burden and bringing hope back into the classroom, we headed to Rambuke Ela Muslim Maha Vidyalaya and Vilana Nandana Maha Vidyalaya. Together, we donated essential stationery kits and school supplies to ensure these bright pupils have exactly what they need to continue their education uninterrupted.\n\nA massive round of applause goes out to our incredible 2026 Batch. This was their very first official event as organizers within AISCA, and they executed it flawlessly.`
  },
  {
    id: '2',
    slug: 'legacy-night-2025',
    name: 'Legacy Night 2025',
    tag: 'Annual Event',
    year: '2025',
    date: 'February 26, 2025',
    coverPhoto: '/events/legacy25/WhatsApp Image 2026-05-20 at 13.51.35.webp',
    photos: [
      '/events/legacy25/WhatsApp Image 2026-05-20 at 13.51.35.webp',
      '/events/legacy25/WhatsApp Image 2026-05-20 at 13.51.36.webp'
    ],
    description: `Looking back at where a new chapter of connection started.. Legacy Night '25 holds a very special place in our hearts as it marked the very first informal yet fun event organized entirely by the All Island Commerce Association.\n\nHosted at the Fingara Club, Colombo. This wasn't just a gathering — it was the night we laid the foundation for a stronger, more united AISCA family. From formal toasts to letting our hair down and sharing laughs, the evening was all about breaking the ice, building lifelong bonds, and strengthening the connections that drive our association forward.\n\nThe energy was unmatched, the memories are unforgettable, and the legacy we started that night continues to grow.`,
    note: 'AISCA Representation'
  },
  {
    id: '1',
    slug: 'cawalk-2025',
    name: 'AISCA CA Walk Meetup',
    tag: 'Networking',
    year: '2025',
    date: 'December 08, 2024',
    coverPhoto: '/events/cawalk/WhatsApp Image 2026-05-20 at 13.51.11.webp',
    photos: [
      '/events/cawalk/WhatsApp Image 2026-05-20 at 13.51.11.webp',
      '/events/cawalk/WhatsApp Image 2026-05-20 at 13.51.12.webp'
    ],
    description: `Proud to have represented AISCA alongside future professionals and inspiring leaders at the CA Walk organized by the Institute of Chartered Accountants of Sri Lanka. From carrying our banners with pride to connecting with the wider community, the event was a great opportunity to showcase our presence, energy, and unity as an association.\n\nAs the first event representing the name AISCA, it was a great opportunity for us to start off with such an event with CA Sri Lanka. It was about creating more visibility, stronger connections, and meaningful experiences together. And sure was a success with all.`,
    note: 'AISCA Representation'
  }
]
