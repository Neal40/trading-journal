import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Trade, PeriodKey } from '../types'
import { generateDemo } from '../data/demo'
import type { TradeSource } from '../data/source'

interface State {
  trades: Trade[]
  period: PeriodKey
  sourceLabel: string
  setPeriod: (p: PeriodKey) => void
  setTrades: (t: Trade[], label: string) => void
  updateTrade: (id: string, patch: Partial<Trade>) => void
  importFrom: (s: TradeSource) => Promise<void>
  reset: () => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      trades: generateDemo(),
      period: 'ALL',
      sourceLabel: 'Données de démo',
      setPeriod: (period) => set({ period }),
      setTrades: (trades, sourceLabel) => set({ trades, sourceLabel }),
      updateTrade: (id, patch) =>
        set((st) => ({
          trades: st.trades.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      importFrom: async (s) => {
        const trades = await s.load()
        set({ trades, sourceLabel: s.label })
      },
      reset: () => set({ trades: generateDemo(), sourceLabel: 'Données de démo' }),
    }),
    { name: 'trading-journal' }
  )
)
