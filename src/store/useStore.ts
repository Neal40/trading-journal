import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Trade, PeriodKey, Account, Ecriture } from '../types'
import { generateDemo } from '../data/demo'
import type { TradeSource } from '../data/source'

const DEFAULT_ACCOUNT: Account = {
  id: 'default',
  name: 'Compte principal',
  type: 'Paper',
  size: 100000,
  startBalance: 100000,
}

interface State {
  trades: Trade[]
  period: PeriodKey
  sourceLabel: string
  accounts: Account[]
  activeAccountId: string
  ecritures: Ecriture[]
  setPeriod: (p: PeriodKey) => void
  setTrades: (t: Trade[], label: string) => void
  updateTrade: (id: string, patch: Partial<Trade>) => void
  importFrom: (s: TradeSource) => Promise<void>
  reset: () => void
  addAccount: (a: Omit<Account, 'id'>) => void
  updateAccount: (id: string, patch: Partial<Account>) => void
  removeAccount: (id: string) => void
  setActiveAccount: (id: string) => void
  addEcriture: (e: Omit<Ecriture, 'id'>) => void
  removeEcriture: (id: string) => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      trades: generateDemo(),
      period: 'ALL',
      sourceLabel: 'Données de démo',
      accounts: [DEFAULT_ACCOUNT],
      activeAccountId: DEFAULT_ACCOUNT.id,
      ecritures: [],
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
      addAccount: (a) =>
        set((st) => {
          const id = crypto.randomUUID()
          return { accounts: [...st.accounts, { ...a, id }], activeAccountId: id }
        }),
      updateAccount: (id, patch) =>
        set((st) => ({
          accounts: st.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAccount: (id) =>
        set((st) => {
          const accounts = st.accounts.filter((a) => a.id !== id)
          return {
            accounts,
            activeAccountId: st.activeAccountId === id && accounts[0] ? accounts[0].id : st.activeAccountId,
          }
        }),
      setActiveAccount: (id) => set({ activeAccountId: id }),
      addEcriture: (e) =>
        set((st) => ({ ecritures: [...st.ecritures, { ...e, id: crypto.randomUUID() }] })),
      removeEcriture: (id) =>
        set((st) => ({ ecritures: st.ecritures.filter((e) => e.id !== id) })),
    }),
    { name: 'trading-journal' }
  )
)
