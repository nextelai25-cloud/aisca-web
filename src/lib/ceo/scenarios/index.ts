import type { Scenario } from '../engine'
import { CAFE } from './cafe'
import { RESTAURANT } from './restaurant'
import { TECH } from './tech'
import { FASHION } from './fashion'
import { HOTEL } from './hotel'
import { SHARED } from './shared'

export const SCENARIOS: Scenario[] = [...CAFE, ...RESTAURANT, ...TECH, ...FASHION, ...HOTEL, ...SHARED]
