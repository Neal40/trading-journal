import type { Trade } from '../types'

/** Toute source de données (démo, CSV, Notion...) implémente cette interface. */
export interface TradeSource {
  id: string
  label: string
  load(): Promise<Trade[]>
}