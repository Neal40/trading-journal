import { useState } from 'react'
import Card from './Card'
import { Seg } from './Toolbar'
import { useStore } from '../store/useStore'
import { computeStats } from '../lib/stats'
import { eur } from '../lib/format'

const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function TimeHeatmap() {
  const trades = useStore(s => s.trades)
  const s = computeStats(trades)
  const [mode, setMode] = useState<'pl' | 'count'>('pl')

  const grid: Record<string, { pl: number; n: number }> = {}
  s.sorted.forEach(t => {
    const d = new Date(t.closeTime)
    const dow = (d.getDay() + 6) % 7
    if (dow > 4) return
    const k = `${dow}-${d.getHours()}`
    grid[k] ??= { pl: 0, n: 0 }
    grid[k].pl += t.profit
    grid[k].n += 1
  })
  const vals = Object.values(grid).map(g => (mode === 'pl' ? Math.abs(g.pl) : g.n))
  const max = Math.max(1, ...vals)

  const color = (g?: { pl: number; n: number }) => {
    if (!g) return 'transparent'
    if (mode === 'count') return `rgba(77,159,255,${0.15 + (g.n / max) * 0.7})`
    const a = 0.15 + (Math.abs(g.pl) / max) * 0.7
    return g.pl >= 0 ? `rgba(34,197,94,${a})` : `rgba(239,68,68,${a})`
  }

  return (
    <Card
      title="Performance par heure et jour"
      toolbar={<Seg value={mode} onChange={setMode} options={[{ v: 'pl', l: 'P/L' }, { v: 'count', l: 'Trades' }]} />}
    >
      <div className="heat">
        <div />
        {HOURS.map(h => <div key={h} className="hl">{h}</div>)}
        {DOW.map((d, di) => (
          <div key={d} style={{ display: 'contents' }}>
            <div className="hl">{d}</div>
            {HOURS.map(h => {
              const g = grid[`${di}-${h}`]
              return (
                <div
                  key={h}
                  className="hc"
                  style={{ background: color(g) }}
                  title={g ? `${d} ${h}h : ${eur(g.pl)} (${g.n} trades)` : ''}
                />
              )
            })}
          </div>
        ))}
      </div>
    </Card>
  )
}