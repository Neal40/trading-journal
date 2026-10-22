import { Radar } from 'react-chartjs-2'
import { Card } from './Card'
import type { Stats } from '../lib/stats'
import { baseOpts } from '../lib/chart'

export function SocialRadar({ s }: { s: Stats }) {
  return (
    <Card title="Hexagone social">
      <div className="legend"><span className="pos">Vous</span><span>/ Moyenne utilisateur</span></div>
      <div className="chartbox" style={{ height: 340 }}>
        <Radar options={{ ...baseOpts, scales: { r: { grid: { color: '#222' }, angleLines: { color: '#222' }, ticks: { display: false }, pointLabels: { color: '#fff' } } } } as any}
          data={{
            labels: ['Winrate', 'RR', 'DD', 'Positions', 'Risque'], datasets: [
              { data: [s.winrate, Math.min(100, s.rrReal * 30), s.maxDD * 100 * 8, Math.min(100, s.n * 3), 5], backgroundColor: 'rgba(37,60,230,.45)', borderColor: '#3347f0', pointBackgroundColor: '#3347f0' },
              { data: [45, 40, 30, 35, 25], backgroundColor: 'rgba(120,120,120,.25)', borderColor: 'transparent', pointRadius: 0 },
            ]
          }} />
      </div>
    </Card>
  )
}