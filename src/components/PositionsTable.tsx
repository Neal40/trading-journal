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

// NQ / ES = minis (1 à 5) ; MNQ / MES = micros (1 à 50)
function maxContracts(symbol: string): number {
  const s = symbol.toUpperCase()
  if (s.startsWith('MNQ') || s.startsWith('MES')) return 50
  if (s.startsWith('NQ') || s.startsWith('ES')) return 5
  return 50
}

const num = (v: number | null | undefined) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : String(v)

export default function PositionsTable() {
  const trades = useStore(s => s.trades)
  const updateTrade = useStore(s => s.updateTrade)
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

  const addReason = (t: Trade, r: string) => {
    if (!r) return
    const reasons = t.reasons ?? []
    if (reasons.includes(r)) return
    updateTrade(t.id, { reasons: [...reasons, r] })
  }
  const removeReason = (t: Trade, r: string) => {
    updateTrade(t.id, { reasons: (t.reasons ?? []).filter(x => x !== r) })
  }

  const setContracts = (t: Trade, raw: string) => {
    const max = maxContracts(t.symbol)
    let n = parseInt(raw, 10)
    if (Number.isNaN(n)) n = 1
    n = Math.max(1, Math.min(max, n))
    updateTrade(t.id, { volume: n })
  }

  const addImages = (t: Trade, files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(f => {
      const reader = new FileReader()
      reader.onload = () => {
        const cur = useStore.getState().trades.find(x => x.id === t.id)
        updateTrade(t.id, { images: [...(cur?.images ?? []), String(reader.result)] })
      }
      reader.readAsDataURL(f)
    })
  }
  const removeImage = (t: Trade, i: number) => {
    updateTrade(t.id, { images: (t.images ?? []).filter((_, k) => k !== i) })
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
              <th>Contrats</th>
              <th>Entrée</th>
              <th>SL</th>
              <th>TP</th>
              <th>Sortie</th>
              <th>Comm.</th>
              {th('profit', 'P/L')}
              {th('r', 'R')}
              <th>Raisons hors plan</th>
              <th>Règles respectées</th>
              <th>Commentaire</th>
              <th>Images</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(t => {
              const available = REASONS.filter(r => !(t.reasons ?? []).includes(r))
              return (
                <tr key={t.id}>
                  <td>{t.closeTime.slice(0, 16).replace('T', ' ')}</td>
                  <td>{t.symbol}</td>
                  <td>{t.type}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={maxContracts(t.symbol)}
                      value={t.volume}
                      onChange={e => setContracts(t, e.target.value)}
                      style={{ width: 56 }}
                      title={`1 à ${maxContracts(t.symbol)}`}
                    />
                  </td>
                  <td className="r">{num(t.entry)}</td>
                  <td className="r">{num(t.sl)}</td>
                  <td className="r">{num(t.tp)}</td>
                  <td className="r">{num(t.exit)}</td>
                  <td className="r">{eur(t.commission)}</td>
                  <td className={'r ' + cls(t.profit)}>{eur(t.profit)}</td>
                  <td className={'r ' + cls(t.r)}>{fmt(t.r)}R</td>
                  <td style={{ minWidth: 170 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                      {(t.reasons ?? []).map(r => (
                        <span
                          key={r}
                          style={{
                            background: TAG_COLORS[r] ?? '#4a4a4a',
                            color: '#fff',
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontSize: 11,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {r}
                          <span
                            onClick={() => removeReason(t, r)}
                            style={{ cursor: 'pointer', fontWeight: 700 }}
                            title="Retirer"
                          >×</span>
                        </span>
                      ))}
                      {available.length > 0 && (
                        <select
                          value=""
                          onChange={e => addReason(t, e.target.value)}
                          style={{ width: 28, fontSize: 12, cursor: 'pointer' }}
                          title="Ajouter une raison"
                        >
                          <option value="">+</option>
                          {available.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      value={t.rulesRespected === null || t.rulesRespected === undefined ? '' : t.rulesRespected ? 'oui' : 'non'}
                      onChange={e => updateTrade(t.id, {
                        rulesRespected: e.target.value === '' ? null : e.target.value === 'oui',
                      })}
                    >
                      <option value="">—</option>
                      <option value="oui">OUI</option>
                      <option value="non">NON</option>
                    </select>
                  </td>
                  <td>
                    <textarea
                      value={t.comment ?? ''}
                      onChange={e => updateTrade(t.id, { comment: e.target.value })}
                      placeholder="Commentaire…"
                      rows={2}
                      style={{ width: '100%', minWidth: 160 }}
                    />
                  </td>
                  <td style={{ minWidth: 110 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                      {(t.images ?? []).map((src, i) => (
                        <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
                          <img src={src} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
                          <span
                            onClick={() => removeImage(t, i)}
                            style={{ position: 'absolute', top: -6, right: -6, background: '#c0392b', color: '#fff', borderRadius: '50%', width: 14, height: 14, fontSize: 10, textAlign: 'center', lineHeight: '14px', cursor: 'pointer' }}
                          >×</span>
                        </span>
                      ))}
                      <label className="btn" style={{ cursor: 'pointer' }}>
                        +
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                          onChange={e => { addImages(t, e.target.files); e.target.value = '' }}
                        />
                      </label>
                    </div>
                  </td>
                </tr>
              )
            })}
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
