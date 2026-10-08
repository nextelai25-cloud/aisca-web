import type { Scenario } from '../engine'
import { CAFE } from './cafe'
import { RESTAURANT } from './restaurant'
import { TECH } from './tech'
import { FASHION } from './fashion'
import { HOTEL } from './hotel'
import { SHARED } from './shared'
import { DEMO } from './demo'

/** Official competition scenarios. */
export const SCENARIOS: Scenario[] = [...CAFE, ...RESTAURANT, ...TECH, ...FASHION, ...HOTEL, ...SHARED]

/** Demo-only scenarios. Kept completely separate: no scenario is in both lists. */
export const DEMO_SCENARIOS: Scenario[] = DEMO

const overlap = SCENARIOS.filter(a => DEMO_SCENARIOS.some(b => b.id === a.id))
if (overlap.length) throw new Error(`Scenario in both demo and official sets: ${overlap.map(o => o.id).join(', ')}`)
