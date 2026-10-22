import { Card } from './Card'
import { useStore } from '../store/useStore'
import { computeStats } from '../lib/stats'
import { eur, cls } from '../lib/format'

export default function FeesSummary() {
  const trades = useStore(s => s.trades)
  const s = computeStats(trades)
  const commission = s.sorted.reduce((a, t) => a + (t.commission ?? 0), 0)
  const gross = s.sorted.reduce((a, t) => a + t.profit, 0)
  const rows: [string, number][] = [
    ['Profit brut', gross],
    ['Commissions', commission],
    ['Total frais', commission],
    ['Profit net', gross + commission],
  ]
  return (
    <Card title="Résumé des frais">
      <table className="tbl">
        <tbody>
          {rows.map(([l, v]) => (
            <tr key={l}>
              <td>{l}</td>
              <td className={'r ' + cls(v)}>{eur(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
