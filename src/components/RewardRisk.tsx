import { Card } from './Card'
import type { Stats } from '../lib/stats'
import type { Trade } from '../types'
import { fmt } from '../lib/format'

/** RR voulu = moyenne |TP-entrée| / |entrée-SL| sur les trades qui ont SL+TP. */
function wantedRR(trades: Trade[]) {
  const v = trades.filter(t => t.sl && t.tp).map(t => Math.abs(t.tp! - t.entry) / Math.abs(t.entry - t.sl!))
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
}

export function RewardRisk({ s }: { s: Stats }) {
  const real = s.rrReal, want = wantedRR(s.sorted), diff = real - want
  const mx = Math.max(real, Math.abs(diff), want, 0.5)
  const bars = [
    { n: real, c: 'pos', bg: '#14532d', bd: '#22c55e' },
    { n: diff, c: 'cy', bg: '#056b66', bd: '#22f0e0' },
    { n: want, c: 'pos', bg: '#14532d', bd: '#22c55e' },
  ]
  return (
    <Card title="Reward / Risk">
      <div className="legend"><span className="pos">RR réel</span><span className="cy">Différence</span><span className="pos">RR voulu</span></div>
      <div className="rrwrap">
        {bars.map((b, i) => (
          <div className="rrbar" key={i}>
            <div className={'n ' + b.c}>{fmt(b.n, 1)}</div>
            <div className="b" style={{ height: Math.max(4, Math.abs(b.n) / mx * 180), background: b.bg, borderTop: `3px solid ${b.bd}` }} />
          </div>))}
      </div>
      <div className="note" style={{ marginTop: 18 }}>Le RR réel est calculé en faisant la moyenne de vos profits, divisé par la moyenne de vos pertes. Le RR voulu est calculé en fonction des Stop-Loss et Take-Profit que vous avez positionnés totalement indépendamment de votre PNL réalisé.</div>
    </Card>
  )
}