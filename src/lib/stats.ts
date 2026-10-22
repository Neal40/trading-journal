import type { Trade, PeriodKey } from '../types'

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)

export function filterPeriod(trades: Trade[], p: PeriodKey): Trade[] {
  if (p === 'ALL' || !trades.length) return trades
  const days = { '1J': 1, '1S': 7, '1M': 30, '1A': 365 }[p]
  const last = Math.max(...trades.map(t => +new Date(t.closeTime)))
  return trades.filter(t => +new Date(t.closeTime) >= last - days * 86400000)
}

/**
 * Calcule les statistiques d'un ensemble de trades.
 * @param startBalance solde de départ du compte (issu de la page Comptes)
 */
export function computeStats(trades: Trade[], startBalance: number) {
  const sorted = [...trades].sort((a, b) => +new Date(a.closeTime) - +new Date(b.closeTime))
  const n = sorted.length
  const wins = sorted.filter(t => t.profit > 0)
  const losses = sorted.filter(t => t.profit < 0)
  const gp = sum(wins.map(t => t.profit))
  const gl = Math.abs(sum(losses.map(t => t.profit)))
  const avgW = wins.length ? gp / wins.length : 0
  const avgL = losses.length ? gl / losses.length : 0

  let cw = 0, cl = 0, maxW = 0, maxL = 0
  sorted.forEach(t => {
    if (t.profit > 0) { cw++; cl = 0 } else if (t.profit < 0) { cl++; cw = 0 }
    maxW = Math.max(maxW, cw); maxL = Math.max(maxL, cl)
  })

  // Equity + bornes latentes
  const eq = [startBalance], hi = [startBalance], lo = [startBalance]
  let run = startBalance
  sorted.forEach(t => {
    run += t.profit
    eq.push(run); hi.push(run + Math.abs(t.mfe) * 0.6); lo.push(run - Math.abs(t.mae) * 0.6)
  })

  // Drawdown
  let peak = startBalance
  const ddReal = [100], ddLat = [100]
  sorted.forEach((_, i) => {
    peak = Math.max(peak, eq[i + 1])
    ddReal.push(100 - ((peak - eq[i + 1]) / peak) * 100)
    ddLat.push(100 - ((peak - lo[i + 1]) / peak) * 100)
  })
  const maxDD = Math.max(0.0001, ...ddReal.map(v => (100 - v) / 100))

  // Sharpe / Sortino / Calmar
  const rets = sorted.map(t => t.profit / startBalance)
  const mean = n ? sum(rets) / n : 0
  const sd = Math.sqrt(sum(rets.map(r => (r - mean) ** 2)) / (n || 1))
  const dsd = Math.sqrt(sum(rets.filter(r => r < 0).map(r => r * r)) / (n || 1))
  const total = eq[eq.length - 1] / startBalance - 1

  // Durée sous l'eau (jours)
  let longest = 0, curStart: number | null = null
  let hwm = startBalance
  sorted.forEach((t, i) => {
    const ts = +new Date(t.closeTime)
    if (eq[i + 1] >= hwm) {
      hwm = eq[i + 1]
      if (curStart !== null) { longest = Math.max(longest, (ts - curStart) / 86400000); curStart = null }
    } else if (curStart === null) curStart = ts
  })
  if (curStart !== null && sorted.length) longest = Math.max(longest, (+new Date(sorted[n - 1].closeTime) - curStart) / 86400000)

  const top5 = sorted.length >= 5 && gp > 0
    ? (sum([...wins].sort((a, b) => b.profit - a.profit).slice(0, 5).map(t => t.profit)) / gp) * 100 : null

  const durSec = (t: Trade) => Math.max(1, (+new Date(t.closeTime) - +new Date(t.openTime)) / 1000)

  return {
    sorted, n, wins, losses, gp, gl, avgW, avgL,
    pf: gl ? gp / gl : gp ? Infinity : 0,
    expR: n ? sum(sorted.map(t => t.r)) / n : 0,
    expEur: n ? sum(sorted.map(t => t.profit)) / n : 0,
    maxW, maxL, top5,
    winrate: n ? (wins.length / n) * 100 : 0,
    rrReal: avgL ? avgW / avgL : 0,
    eq, hi, lo, ddReal, ddLat, maxDD, underwater: longest,
    sharpe: sd ? mean / sd : 0, sortino: dsd ? mean / dsd : 0, calmar: total / maxDD,
    balance: eq[eq.length - 1], totalPct: total * 100,
    totalProfit: sum(sorted.map(t => t.profit)),
    durSec,
  }
}

export type Stats = ReturnType<typeof computeStats>

export function heatmap(trades: Trade[]) {
  const g: Record<string, { r: number; n: number; w: number }> = {}
  trades.forEach(t => {
    const d = new Date(t.closeTime)
    const k = `${(d.getDay() + 6) % 7}-${d.getHours()}`
    g[k] ??= { r: 0, n: 0, w: 0 }
    g[k].r += t.r; g[k].n++; if (t.profit > 0) g[k].w++
  })
  return g
}

export function byDay(trades: Trade[]) {
  const m: Record<string, { pl: number; r: number; n: number }> = {}
  trades.forEach(t => {
    const k = t.closeTime.slice(0, 10)
    m[k] ??= { pl: 0, r: 0, n: 0 }
    m[k].pl += t.profit; m[k].r += t.r; m[k].n++
  })
  return m
}
