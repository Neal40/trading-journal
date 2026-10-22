import { useState } from 'react'
import { Scatter } from 'react-chartjs-2'
import { Card, Seg } from './Card'
import type { Stats } from '../lib/stats'
import { baseOpts, grid } from '../lib/chart'
import { fmt, fmtDur } from '../lib/format'

export function DurationScatter({ s }: { s: Stats }) {
  const [xs, setXs] = useState('log')
  const [ys, setYs] = useState('lin')
  const pts = (f: (r: number) => boolean) => s.sorted.filter(t => f(t.r)).map(t => ({ x: s.durSec(t), y: t.r, sym: t.symbol }))
  return (
    <Card title="Durée × Résultat" toolbar={<>
      <span className="muted">Durée</span><Seg value={xs} onChange={setXs} options={[{ v: 'lin', l: 'Linéaire' }, { v: 'log', l: 'Log' }]} />
      <span className="muted" style={{ marginLeft: 8 }}>Résultat</span><Seg value={ys} onChange={setYs} options={[{ v: 'lin', l: 'Linéaire' }, { v: 'log', l: 'Log' }]} />
    </>}>
      <div className="legend"><span className="pos">Profits</span>/<span className="neg">Pertes</span> <span className="muted">- durée de détention × résultat en R</span></div>
      <div className="chartbox" style={{ height: 340 }}>
        <Scatter
          options={{
            ...baseOpts,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => `${c.raw.sym} · ${fmtDur(c.raw.x)} · ${fmt(c.raw.y)} R` } } },
            scales: {
              x: { type: xs === 'log' ? 'logarithmic' : 'linear', grid, ticks: { callback: (v: any) => fmtDur(+v) } },
              y: { type: 'linear', grid, ...(ys === 'lin' ? { min: -2, max: 4 } : {}) },
            },
          } as any}
          data={{
            datasets: [
              { data: pts(r => r >= 0), backgroundColor: '#22c55e', pointRadius: 5 },
              { data: pts(r => r < 0), backgroundColor: '#ef4444', pointRadius: 5 }]
          }} />
      </div>
      <div className="note">Avec un RR moyen de {fmt(s.rrReal)}, l'objectif est {fmt(s.rrReal)} fois plus loin que le stop : une perte est naturellement plus courte qu'un gain.<br />Analyse au RR dès 10 gagnants et 10 perdants ({s.wins.length} / {s.losses.length}).</div>
    </Card>
  )
}