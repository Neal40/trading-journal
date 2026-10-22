import { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Card, Seg } from './Card'
import type { Stats } from '../lib/stats'
import { baseOpts } from '../lib/chart'

export function RiskDistribution({ s }: { s: Stats }) {
  const [mode, setMode] = useState('all')
  const buckets: Record<string, number> = {}
  for (let v = -10; v <= 20; v++) buckets[(v / 10).toFixed(1)] = 0
  s.sorted.forEach(t => {
    const k = (Math.max(-1, Math.min(2, Math.round(t.r * 10) / 10))).toFixed(1)
    buckets[k]++
  })
  let keys = Object.keys(buckets)
  if (mode === 'hide') keys = keys.filter(k => Math.abs(+k) > 0.1)
  // Cache les colonnes vides aux extrémités
  const used = keys.filter(k => buckets[k] > 0)
  if (used.length) keys = keys.slice(keys.indexOf(used[0]), keys.indexOf(used[used.length - 1]) + 1)
  const vals = keys.map(k => buckets[k])
  const be = (k: string) => Math.abs(+k) <= 0.1

  const labelPlugin = {
    id: 'lbl',
    afterDatasetsDraw(c: any) {
      const x = c.ctx; x.fillStyle = '#ddd'; x.textAlign = 'center'
      c.getDatasetMeta(0).data.forEach((b: any, i: number) => { if (vals[i]) x.fillText(String(vals[i]), b.x, b.y - 6) })
    },
  }
  return (
    <Card title="Distribution Risk / Reward" toolbar={<Seg value={mode} onChange={setMode} options={[{ v: 'all', l: 'Tous' }, { v: 'hide', l: 'Masquer les BE' }]} />}>
      <div className="chartbox" style={{ height: 260, marginTop: 20 }}>
        <Bar plugins={[labelPlugin]}
          options={{ ...baseOpts, scales: { x: { grid: { display: false } }, y: { display: false } } } as any}
          data={{
            labels: keys.map(k => (+k > 0 ? '+' : '') + k), datasets: [{
              data: vals,
              backgroundColor: keys.map(k => be(k) ? '#2a2a2a' : +k > 0 ? '#14532d' : '#4a1818'),
              borderColor: keys.map(k => be(k) ? '#777' : +k > 0 ? '#22c55e' : '#ef4444'),
              borderWidth: { top: 3, left: 0, right: 0, bottom: 0 } as any,
            }]
          }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 8 }}>
        <span className="neg">PERTES</span><span className="muted">BREAK EVEN</span><span className="pos">PROFITS</span>
      </div>
    </Card>
  )
}