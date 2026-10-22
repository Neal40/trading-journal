import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Card, Seg } from './Card'
import type { Stats } from '../lib/stats'
import { baseOpts, grid } from '../lib/chart'
import { eur, fmt } from '../lib/format'

export function PerformanceChart({ s }: { s: Stats }) {
  const [last, setLast] = useState('0')
  const nn = +last
  const st = nn ? Math.max(0, s.eq.length - nn - 1) : 0
  const L = s.eq.slice(st).map((_, i) => i + st)
  const a = s.eq[st], b = s.eq[s.eq.length - 1]

  return (
    <Card title="Graphique de performance"
      toolbar={<Seg value={last} onChange={setLast} options={[
        { v: '10', l: '10' }, { v: '25', l: '25' }, { v: '50', l: '50' }, { v: '100', l: '100' }, { v: '0', l: 'MAX' }]} />}>
      <div className="big" style={{ marginTop: 28 }}>
        {eur(s.balance)} <span className={s.totalPct >= 0 ? 'pos' : 'neg'} style={{ fontSize: 12 }}>{fmt(s.totalPct)}%</span>
      </div>
      <div className="legend"><span className="pos">PNL Réalisé</span><span className="pos">Max Gain Latent</span><span className="neg">Max DD Latent</span><span className="neg">Moyenne Itinéraire</span></div>
      <div className="chartbox" style={{ height: 340 }}>
        <Line options={{ ...baseOpts, scales: { x: { grid }, y: { grid, ticks: { callback: (v: string | number) => fmt(+v, 0) } } } } as any}
          data={{
            labels: L, datasets: [
              { data: s.hi.slice(st), borderColor: 'transparent', backgroundColor: 'rgba(34,120,60,.45)', fill: '+1', tension: .4, pointRadius: 0 },
              { data: s.eq.slice(st), borderColor: '#1d9bf0', borderWidth: 2, tension: .4, pointRadius: 0 },
              { data: s.lo.slice(st), borderColor: 'transparent', backgroundColor: 'rgba(120,35,40,.5)', fill: '-1', tension: .4, pointRadius: 0 },
              { data: L.map((_, i) => a + (b - a) * i / (L.length - 1 || 1)), borderColor: '#ff5a5a', borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0 },
            ]
          }} />
      </div>
    </Card>
  )
}
