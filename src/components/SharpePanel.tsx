import { Bar } from 'react-chartjs-2'
import { Card } from './Card'
import type { Stats } from '../lib/stats'
import { baseOpts, grid } from '../lib/chart'
import { fmt, cls } from '../lib/format'

export function SharpePanel({ s }: { s: Stats }) {
  return (
    <Card title="Sharpe Ratio">
      <div className="legend"><span className="neg">Votre SR</span>/<span style={{ color: '#60a5fa' }}>Moy. Utilisateurs</span></div>
      <div className="chartbox">
        <Bar options={{ ...baseOpts, scales: { x: { display: false }, y: { grid, min: -1, max: 1 } } } as any}
          data={{ labels: ['Vous', 'Moy.'], datasets: [{ data: [s.sharpe, 0.2], backgroundColor: ['#5a1f22', '#1f3a5f'], borderColor: ['#ef4444', '#60a5fa'], borderWidth: { top: 3 } as any }] }} />
      </div>
      <div className="note row"><span>Sortino</span><b className={cls(s.sortino)}>{fmt(s.sortino, 1)}</b></div>
      <div className="note row"><span>Calmar</span><b className={cls(s.calmar)}>{fmt(s.calmar, 1)}</b></div>
    </Card>
  )
}