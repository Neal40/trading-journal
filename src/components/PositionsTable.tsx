import { useMemo, useState } from 'react'
import { Card } from './Card'
import { useStore } from '../store/useStore'
import { computeStats } from '../lib/stats'
import { eur, fmt, cls } from '../lib/format'
import type { Trade } from '../types'

type SortKey = 'closeTime' | 'symbol' | 'profit' | 'r'

export default function PositionsTable() {
  const trades = useStore(s => s.trades)
  const s = computeStats(trades)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortKey>('closeTime')
  const [asc, setAsc] = useState(false)
  const [page, setPage] = useState(0)
  const PER = 15

  const rows = useMemo(() => {
    const filtered = s.sorted.filter(t => t.symbol.toLowerCase().includes(q.toLowerCase()))
    return [...filtered].sort((a: Trade, b: Trade) => {
      const x = a[sort], y = b[sort]
      const c = x < y ? -1 : x > y ? 1 : 0
      return asc ? c : -c
    })
  }, [s.sorted, q, sort, asc])

  const pages = Math.max(1, Math.ceil(rows.length / PER))
  const visible = rows.slice(page * PER, page * PER + PER)
  const th = (k: SortKey, l: string) => (
    <th onClick={() => { sort === k ? setAsc(!asc) : (setSort(k), setAsc(false)) }} style={{ cursor: 'pointer' }}>
      {l}{sort === k ? (asc ? ' ▲' : ' ▼') : ''}
    </th>
  )

  return (
    <Card
      title="Positions"
      toolbar={
        <input
          className="input"
          placeholder="Filtrer symbole…"
          value={q}
          onChange={e => { setQ(e.target.value); setPage(0) }}
        />
      }
    >
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              {th('closeTime', 'Clôture')}
              {th('symbol', 'Symbole')}
              <th>Sens</th>
              {th('profit', 'P/L')}
              {th('r', 'R')}
            </tr>
          </thead>
          <tbody>
            {visible.map(t => (
              <tr key={t.id}>
                <td>{t.closeTime.slice(0, 16).replace('T', ' ')}</td>
                <td>{t.symbol}</td>
                <td>{t.type}</td>
                <td className={'r ' + cls(t.profit)}>{eur(t.profit)}</td>
                <td className={'r ' + cls(t.r)}>{fmt(t.r)}R</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="calfoot">
        <button className="btn" disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
        <span>{page + 1} / {pages}</span>
        <button className="btn" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>›</button>
      </div>
    </Card>
  )
}
