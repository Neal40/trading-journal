import { Bar } from 'react-chartjs-2'
import { Card } from './Card'
import { useStore } from '../store/useStore'
import { computeStats } from '../lib/stats'
import { baseOpts } from '../lib/chart'

export default function SymbolPerformance() {
  const trades = useStore(s => s.trades)
  const s = computeStats(trades)
  const map: Record<string, number> = {}
  s.sorted.forEach(t => { map[t.symbol] = (map[t.symbol] ?? 0) + t.profit })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])

  return (
    <Card title="Performance par symbole">
      <div style={{ height: 260 }}>
        <Bar
          data={{
            labels: entries.map(e => e[0]),
            datasets: [{
              data: entries.map(e => e[1]),
              backgroundColor: entries.map(e => (e[1] >= 0 ? '#22c55e' : '#ef4444')),
              borderRadius: 4,
            }],
          }}
          options={{ ...baseOpts, indexAxis: 'y' as const } as any}
        />
      </div>
    </Card>
  )
}
