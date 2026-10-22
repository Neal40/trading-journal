import { Line } from 'react-chartjs-2'
import { Card, Seg } from './Card'
import { useStore } from '../store/useStore'
import type { Stats } from '../lib/stats'
import { baseOpts, grid } from '../lib/chart'
import { fmt } from '../lib/format'
import type { PeriodKey } from '../types'

export function DrawdownChart({ s }: { s: Stats }) {
  const { period, setPeriod } = useStore()
  return (
    <Card title="Drawdown" toolbar={<>
      <button className="btn active">Positions</button><button className="btn">Temps</button>
      <Seg<PeriodKey> value={period} onChange={setPeriod} options={[
        { v: '1J', l: '1J' }, { v: '1S', l: '1S' }, { v: '1M', l: '1M' }, { v: '1A', l: '1A' }, { v: 'ALL', l: 'All' }]} />
    </>}>
      <div className="legend"><span className="neg">Drawdown Réalisé</span><span style={{ color: '#a79bff' }}>Drawdown Latent</span><span className="muted">- %</span></div>
      <div className="chartbox">
        <Line options={{ ...baseOpts, scales: { x: { grid }, y: { grid } } } as any}
          data={{
            labels: s.ddReal.map((_, i) => i), datasets: [
              { data: s.ddReal, borderColor: '#ef4444', borderWidth: 1.5, pointRadius: 0 },
              { data: s.ddLat, borderColor: '#7c6fb0', borderWidth: 1.5, pointRadius: 0 }]
          }} />
      </div>
      <div className="note">Temps sous l'eau cumulé : <b>{fmt(s.underwater, 1)}j</b> &nbsp; Plus longue période sous l'eau : <b>{fmt(s.underwater, 1)}j</b></div>
    </Card>
  )
}
