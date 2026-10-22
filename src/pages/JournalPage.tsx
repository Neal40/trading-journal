import { useStore } from '../store/useStore'
import { computeStats, filterPeriod } from '../lib/stats'
import { Toolbar } from '../components/Toolbar'
import { KpiRow } from '../components/KpiRow'
import { PerformanceChart } from '../components/PerformanceChart'
import { DrawdownChart } from '../components/DrawdownChart'
import { ReturnChart } from '../components/ReturnChart'
import { WinrateGauge } from '../components/WinrateGauge'
import { RewardRisk } from '../components/RewardRisk'
import { SharpePanel } from '../components/SharpePanel'
import { RiskDistribution } from '../components/RiskDistribution'
import { MaeMfeChart } from '../components/MaeMfeChart'
import { DurationScatter } from '../components/DurationScatter'
import { SocialRadar } from '../components/SocialRadar'
import GainCalendar from '../components/GainCalendar'
import PositionsTable from '../components/PositionsTable'
import TimeHeatmap from '../components/TimeHeatmap'
import SymbolPerformance from '../components/SymbolPerformance'
import FeesSummary from '../components/FeesSummary'

export default function JournalPage() {
  const trades = useStore(s => s.trades)
  const period = useStore(s => s.period)
  const label = useStore(s => s.sourceLabel)
  const s = computeStats(filterPeriod(trades, period))

  return (
    <section>
      <div className="page-head">
        <div>
          <h2 style={{ margin: 0 }}>Journal de trading</h2>
          <div className="muted" style={{ fontSize: 12 }}>{label} · {s.n} positions</div>
        </div>
        <div className="page-actions">
          <button className="btn">Rapport PDF</button>
          <Toolbar />
        </div>
      </div>

      <KpiRow s={s} />

      <div className="grid g2" style={{ marginTop: 16 }}>
        <PerformanceChart s={s} />
        <DrawdownChart s={s} />
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <ReturnChart s={s} />
        <GainCalendar />
      </div>

      <div className="grid g3" style={{ marginTop: 16 }}>
        <WinrateGauge s={s} />
        <RewardRisk s={s} />
        <SharpePanel s={s} />
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <RiskDistribution s={s} />
        <MaeMfeChart s={s} />
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <DurationScatter s={s} />
        <SocialRadar s={s} />
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <TimeHeatmap />
        <SymbolPerformance />
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <FeesSummary />
        <PositionsTable />
      </div>
    </section>
  )
}
