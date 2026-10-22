import type { Stats } from '../lib/stats'
import { fmt, eur, cls } from '../lib/format'

export function KpiRow({ s }: { s: Stats }) {
  const items = [
    { l: 'Profit factor', v: isFinite(s.pf) ? fmt(s.pf) : '∞', c: s.pf >= 1 ? 'pos' : 'neg' },
    { l: 'Espérance / trade', v: fmt(s.expR) + ' R', c: cls(s.expR), sub: eur(s.expEur) },
    { l: 'Série gagnante max', v: String(s.maxW), c: 'pos' },
    { l: 'Série perdante max', v: String(s.maxL), c: 'neg' },
    { l: 'Part top 5 trades', v: s.top5 == null ? '—' : fmt(s.top5, 1) + '%', c: '' },
    { l: 'Efficience de sortie', v: fmt(effi(s), 1) + '%', c: '' },
  ]
  return (
    <div className="grid g6">
      {items.map(k => (
        <div className="card kpi" key={k.l}>
          <div className="title">{k.l}</div>
          <div className={'v ' + k.c}>{k.v}</div>
          <div className="s">{k.sub ?? '\u00a0'}</div>
        </div>
      ))}
    </div>
  )
}

function effi(s: Stats) {
  const w = s.wins.filter(t => t.mfe > 0)
  if (!w.length) return 0
  return (w.reduce((a, t) => a + t.profit / t.mfe, 0) / w.length) * 100
}