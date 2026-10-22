import { useStore } from '../store/useStore'
import { computeStats } from '../lib/stats'
import { KpiRow } from '../components/KpiRow'
import GainCalendar from '../components/GainCalendar'
import PositionsTable from '../components/PositionsTable'

export default function JournalPage() {
  const trades = useStore(s => s.trades)
  const s = computeStats(trades)

  return (
    <section>
      <h2>Journal de trading</h2>
      <KpiRow s={s} />
      <div className="grid g2" style={{ marginTop: 16 }}>
        <GainCalendar />
        <PositionsTable />
      </div>
    </section>
  )
}
