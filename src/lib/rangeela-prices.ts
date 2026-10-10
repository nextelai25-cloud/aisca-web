import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_PRICES, type RangeelaPrices } from '@/lib/rangeela'

/**
 * Server only. The live RANGEELA '26 prices, set by the chairman in
 * admin.aisca.lk (table rangeela_settings). Falls back to the defaults in
 * lib/rangeela.ts if the row can't be read, so the page never breaks.
 */
export async function getRangeelaPrices(): Promise<RangeelaPrices> {
  try {
    const { data, error } = await supabaseAdmin
      .from('rangeela_settings')
      .select('online_price, gate_price')
      .eq('id', 1)
      .maybeSingle()
    if (error || !data) return DEFAULT_PRICES
    const standard = Number(data.online_price), gate = Number(data.gate_price)
    if (!(standard > 0) || !(gate > 0)) return DEFAULT_PRICES
    return { standard, gate }
  } catch {
    return DEFAULT_PRICES
  }
}
