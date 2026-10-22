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
    <section className="journal">
      {/* Bandeau compte */}
      <div className="acct">
        <div className="acct-ico">🏛</div>
        <div className="acct-info">
          <div><b>{label}</b> <span className="sb-mute">Login :</span></div>
          <div className="pos" style={{ fontSize: 12 }}>Funded - Statut : Inconnu</div>
          <div className="neg" style={{ fontSize: 12 }}>{s.n} positions</div>
        </div>
        <button className="btn-blue">Changer de compte</button>
      </div>

      <div className="page-actions right">
        <button className="btn">Rapport PDF</button>
        <Toolbar />
      </div>

      <KpiRow s={s} />

      {/* 1. Graphique de performance + Hexagone social */}
      <div className="grid g-main">
        <PerformanceChart s={s} />
        <SocialRadar s={s} />
      </div>

      {/* 2. Positions (pleine largeur) */}
      <PositionsTable />

      {/* 3. Winrate + Rendement */}
      <div className="grid g-main">
        <WinrateGauge s={s} />
        <ReturnChart s={s} />
      </div>

      {/* 4. Drawdown + Reward/Risk */}
      <div className="grid g-main">
        <DrawdownChart s={s} />
        <RewardRisk s={s} />
      </div>

      {/* 5. Sharpe + MAE/MFE */}
      <div className="grid g-side">
        <SharpePanel s={s} />
        <MaeMfeChart s={s} />
      </div>

      {/* 6. Distribution Risk/Reward */}
      <RiskDistribution s={s} />

      {/* 7. Calendrier + Heatmap */}
      <div className="grid g-half">
        <GainCalendar />
        <TimeHeatmap />
      </div>

      {/* 8. Frais + Performance par symbole */}
      <div className="grid g-half">
        <FeesSummary />
        <SymbolPerformance />
      </div>

      {/* 9. Durée x Résultat */}
      <DurationScatter s={s} />
    </section>
  )
}
