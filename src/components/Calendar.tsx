import { useState } from 'react'
import { addMonths, getDaysInMonth, format as f } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, Seg } from './Card'
import { useStore } from '../store/useStore'
import { computeStats, byDay, START_BALANCE } from '../lib/stats'
import { eur, fmt, cls } from '../lib/format'

type Mode = 'eur' | 'r' | 'pct' | 'trades'

const dotColor = (t: { status?: string; profit: number }) => {
  if (t.status === 'Pas pris') return '#8b5cf6'
  if (t.profit > 0) return '#22c55e'
  if (t.profit < 0) return '#ef4444'
  return '#eab308'
}

export default function Calendar() {
  const trades = useStore(s => s.trades)
  const s = computeStats(trades)
  const [cur, setCur] = useState(new Date())
  const [mode, setMode] = useState<Mode>('eur')
  const days = byDay(s.sorted)
  const y = cur.getFullYear(), m = cur.getMonth()
  const prefix = `${y}-${String(m + 1).padStart(2, '0')}`
  const dim = getDaysInMonth(cur)
  const off = (new Date(y, m, 1).getDay() + 6) % 7
  const key = (d: number) => `${prefix}-${String(d).padStart(2, '0')}`
  const monthTrades = s.sorted.filter(t => t.closeTime.startsWith(prefix))
  const tot = monthTrades.reduce((a, t) => a + t.profit, 0)
  const totR = monthTrades.reduce((a, t) => a + t.r, 0)
  const wins = monthTrades.filter(t => t.profit > 0).length

  const cells: (number | null)[] = [
    ...Array(off).fill(null),
    ...Array.from({ length: dim }, (_, i) => i + 1),
  ]
  while (cells.length % 7) cells.push(null)

  const val = (e: { pl: number; r: number }) =>
    mode === 'eur' ? eur(e.pl) : mode === 'r' ? fmt(e.r) + 'R' : fmt((e.pl / START_BALANCE) * 100) + '%'

  const rows = []
  for (let i = 0; i < cells.length; i += 7) {
    let wk = 0, has = false
    const row = cells.slice(i, i + 7).map((d, j) => {
      if (!d) return <div key={j} />
      const k = key(d)
      const dayTrades = s.sorted.filter(t => t.closeTime.startsWith(k))
      const e = days[k]
      if (!e) return <div key={j} className="d">{d}</div>
      wk += e.pl; has = true
      if (mode === 'trades') {
        return (
          <div key={j} className="d has">
            {d}
            {dayTrades.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor(t), display: 'inline-block' }} />
                <span>{t.symbol}</span>
              </div>
            ))}
          </div>
        )
      }
      return (
        <div key={j} className="d has" style={{ background: e.pl >= 0 ? '#0f3a20' : '#3a1212' }}>
          {d}<span className={'val ' + cls(e.pl)}>{val(e)}</span>
        </div>
      )
    })
    rows.push(
      <div className="calrow" key={i}>
        {row}
        <div className={'w ' + cls(wk)}>{has ? eur(wk) : '–'}</div>
      </div>
    )
  }

  return (
    <Card
      title="Calendrier"
      toolbar={
        <Seg
          value={mode}
          onChange={setMode}
          options={[
            { v: 'eur', l: 'Devise' },
            { v: 'r', l: 'R' },
            { v: 'pct', l: '%' },
            { v: 'trades', l: 'Trades' },
          ]}
        />
      }
    >
      <div className="calhead">
        <button className="btn" onClick={() => setCur(addMonths(cur, -1))}>‹</button>
        <b style={{ textTransform: 'capitalize' }}>{f(cur, 'MMMM yyyy', { locale: fr })}</b>
        <button className="btn" onClick={() => setCur(addMonths(cur, 1))}>›</button>
      </div>
      <div className="calrow dow">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d}>{d}</div>)}
        <div>Sem.</div>
      </div>
      {rows}
      <div className="calfoot">
        <span>Trades : <b>{monthTrades.length}</b></span>
        <span>Win : <b>{monthTrades.length ? Math.round((wins / monthTrades.length) * 100) : 0}%</b></span>
        <span>Total : <b className={cls(tot)}>{eur(tot)}</b></span>
        <span>R : <b className={cls(totR)}>{fmt(totR)}R</b></span>
      </div>
    </Card>
  )
}
