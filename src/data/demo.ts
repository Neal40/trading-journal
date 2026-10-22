import type { Trade } from '../types'
import type { TradeSource } from './source'

export function generateDemo(n = 40): Trade[] {
  let seed = 42
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const syms = ['NAS', 'NAS', 'NAS', 'SP']
  const out: Trade[] = []
  let t = new Date(2025, 9, 1, 10).getTime()
  for (let i = 0; i < n; i++) {
    const win = rnd() < 0.35
    const r = win ? 0.3 + rnd() * 3 : -(0.1 + rnd() * 1.6)
    const risk = 300 + rnd() * 500
    const symbol = syms[Math.floor(rnd() * syms.length)]
    const dur = Math.exp(Math.log(25) + rnd() * Math.log(15000 / 25))
    t += (0.5 + rnd() * 4) * 86400000
    const d = new Date(t)
    d.setHours(9 + Math.floor(rnd() * 11), Math.floor(rnd() * 60))
    const entry = symbol === 'NAS' ? 24500 + rnd() * 1500 : 6800 + rnd() * 100
    const buy = rnd() < 0.25
    const profit = r * risk
    out.push({
      id: 'demo-' + i,
      openTime: d.toISOString(),
      closeTime: new Date(d.getTime() + dur * 1000).toISOString(),
      symbol,
      ticket: String(Math.floor(5e8 + rnd() * 3e8)),
      type: buy ? 'Buy' : 'Sell',
      volume: Math.round(8 + rnd() * 200),
      entry,
      sl: null,
      tp: null,
      exit: entry + (profit > 0 ? 1 : -1) * (buy ? 1 : -1) * rnd() * 60,
      profit,
      commission: 0,
      r,
      mae: -(profit < 0 ? Math.abs(profit) * (0.4 + rnd() * 0.6) : rnd() * 600),
      mfe: profit > 0 ? profit * (1 + rnd() * 0.3) : rnd() * 500,
      tags: [],
      images: [],
    })
  }
  return out
}

export const demoSource: TradeSource = {
  id: 'demo',
  label: 'Données de démo',
  load: async () => generateDemo(),
}
