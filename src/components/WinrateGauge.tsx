import { useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Card } from './Card'
import type { Stats } from '../lib/stats'
import { computeStats } from '../lib/stats'
import { baseOpts } from '../lib/chart'
import { fmt } from '../lib/format'

export function WinrateGauge({ s }: { s: Stats }) {
  const [sym, setSym] = useState('Tous')
  const symbols = Array.from(new Set(s.sorted.map(t => t.symbol)))
  const st = sym === 'Tous' ? s : computeStats(s.sorted.filter(t => t.symbol === sym))
  return (
    <Card title="Winrate %" toolbar={
      <select className="input" value={sym} onChange={e => setSym(e.target.value)}>
        <option>Tous</option>{symbols.map(x => <option key={x}>{x}</option>)}
      </select>}>
      <div className="wr-head">
        <div className="wr-value">{fmt(st.winrate)}%</div>
        <div className="kpi-sub">{st.n} positions</div>
      </div>
      <div className="chartbox" style={{ height: 200 }}>
        <Doughnut options={{ ...baseOpts, rotation: -90, circumference: 180, cutout: '60%', plugins: { legend: { display: false }, tooltip: { enabled: true } } } as any}
          data={{ labels: ['Gagnantes', 'Perdantes'], datasets: [{ data: [st.wins.length, st.losses.length], backgroundColor: ['#22c55e', '#ef4444'], borderWidth: 0 }] }} />
      </div>
      <div className="wr-legend">
        <span><span className="pos">●</span> {st.wins.length} gagnantes</span>
        <span><span className="neg">●</span> {st.losses.length} perdantes</span>
      </div>
      <div className="note-center">Les profits ou pertes en dessous de 0.2% du solde du compte ne sont pas pris en compte.</div>
    </Card>
  )
}
