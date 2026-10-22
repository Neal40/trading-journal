import { useMemo, useState } from 'react'
import { Card } from './Card'
import { useStore } from '../store/useStore'
import { computeStats } from '../lib/stats'
import { eur, fmt, cls } from '../lib/format'
import { REASONS } from '../types'
import type { Trade } from '../types'

type SortKey = 'closeTime' | 'symbol' | 'profit' | 'r'

const TAG_COLORS: Record<string, string> = {
  'FOMO': '#b5652b',
  'Revenge trade': '#c0392b',
  'Taille de position': '#9a7b1f',
  'Hors macro': '#6c4bb0',
  'Setup non A+': '#2a6fb0',
  'News majeure': '#a0456e',
  'Stop déplacé': '#7a7a7a',
  'Sortie anticipée': '#7a5a3a',
  "Oubli d'un élément clé": '#2e8a6a',
  'Autre': '#4a4a4a',
}

export default function PositionsTable() {
  const trades = useStore(s => s.trades)
  const updateTrade = useStore(s => s.updateTrade)
  const s = computeStats(trades)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortKey>('closeTime')
  const [asc, setAsc] = useState(false)
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)
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

  const toggleReason = (t: Trade, r: string) => {
    const reasons = t.reasons ?? []
    updateTrade(t.id, {
      reasons: reasons.includes(r) ? reasons.filter(x => x !== r) : [...reasons, r],
    })
  }

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
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="tbl" style={{ width: '100%' }}>
          <thead>
            <tr>
              {th('closeTime', 'Clôture')}
              {th('symbol', 'Symbole')}
              <th>Sens</th>
              {th('profit', 'P/L')}
              {th('r', 'R')}
              <th>Raisons hors plan</th>
              <th>Règles respectées</th>
              <th>Commentaire</th>
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
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {REASONS.map(r => {
                      const on = (t.reasons ?? []).includes(r)
                      return (
                        <button
                          key={r}
                          onClick={() => toggleReason(t, r)}
                          style={{
                            background: on ? TAG_COLORS[r] : 'transparent',
                            color: on ? '#fff' : '#888',
                            border: `1px solid ${TAG_COLORS[r]}`,
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          {r}
                        </button>
                      )
                    })}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn"
                      onClick={() => updateTrade(t.id, { rulesRespected: true })}
                      style={{ background: t.rulesRespected === true ? '#2e8a6a' : undefined }}
                    >OUI</button>
                    <button
                      className="btn"
                      onClick={() => updateTrade(t.id, { rulesRespected: false })}
                      style={{ background: t.rulesRespected === false ? '#c0392b' : undefined }}
                    >NON</button>
                  </div>
                </td>
                <td>
                  {openId === t.id ? (
                    <textarea
                      autoFocus
                      value={t.comment ?? ''}
                      onChange={e => updateTrade(t.id, { comment: e.target.value })}
                      onBlur={() => setOpenId(null)}
                      rows={2}
                      style={{ width: '100%', minWidth: 160 }}
                    />
                  ) : (
                    <button className="btn" onClick={() => setOpenId(t.id)}>
                      {t.comment ? t.comment.slice(0, 30) + (t.comment.length > 30 ? '…' : '') : '+ Commentaire'}
                    </button>
                  )}
                </td>
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
