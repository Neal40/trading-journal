import { Bar } from 'react-chartjs-2'
import { Card } from './Card'
import type { Stats } from '../lib/stats'
import { byDay } from '../lib/stats'
import { baseOpts, grid } from '../lib/chart'
import { eur, cls } from '../lib/format'

export function ReturnChart({ s }: { s: Stats }) {
  const days = Object.entries(byDay(s.sorted)).sort(([a], [b]) => a.localeCompare(b))
  return (
    <Card title="Rendement" toolbar={
      <div className="seg-row">
        <select className="input"><option>Rendement Net</option><option>Brut</option></select>
        <select className="input"><option>Daily / Monthly</option></select>
      </div>}>
      <div className={'big ' + cls(s.totalProfit)}>{eur(s.totalProfit)}</div>
      <div className="legend"><span>Time</span> / <span className="pos">Positif Rendement</span> / <span className="neg">Négatif Rendement</span></div>
      <div className="chartbox" style={{ height: 220 }}>
        <Bar options={{ ...baseOpts, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 15 } }, y: { grid } } } as any}
          data={{ labels: days.map(([d]) => d.slice(5)), datasets: [{ data: days.map(([, v]) => v.pl), backgroundColor: days.map(([, v]) => v.pl >= 0 ? '#22c55e' : '#ef4444'), borderRadius: 2 }] }} />
      </div>
    </Card>
  )
}
