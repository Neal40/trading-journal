import { useMemo } from 'react'
import { KpiRow } from './components/KpiRow'
import { PerformanceChart } from './components/PerformanceChart'
import { SocialRadar } from './components/SocialRadar'
import { WinrateGauge } from './components/WinrateGauge'
import { RewardRisk } from './components/RewardRisk'
import DrawdownChart from './components/DrawdownChart'
import DurationScatter from './components/DurationScatter'
import ReturnChart from './components/ReturnChart'
import RiskDistribution from './components/RiskDistribution'
import SharpePanel from './components/SharpePanel'
import MaeMfeChart from './components/MaeMfeChart'
import GainCalendar from './components/GainCalendar'
import TimeHeatmap from './components/TimeHeatmap'
import FeesSummary from './components/FeesSummary'
import SymbolPerformance from './components/SymbolPerformance'
import PositionsTable from './components/PositionsTable'
import ImportPanel from './components/ImportPanel'
import { Toolbar } from './components/Toolbar'
import { useStore } from './store/useStore'
import { computeStats, filterPeriod } from './lib/stats'
import './lib/chart'

export default function App() {
  const trades = useStore(s => s.trades)
  const period = useStore(s => s.period)
  const s = useMemo(() => computeStats(filterPeriod(trades, period)), [trades, period])

  return (
    <div className="app">
      <header className="top">
        <h1>Trading Journal</h1>
        <Toolbar />
      </header>
      <KpiRow s={s} />
      <div className="grid g2"><PerformanceChart s={s} /><SocialRadar s={s} /></div>
      <div className="grid g3"><DrawdownChart /><RewardRisk s={s} /><WinrateGauge s={s} /></div>
      <div className="grid g2"><ReturnChart /><DurationScatter /></div>
      <div className="grid g3"><RiskDistribution /><SharpePanel /><MaeMfeChart /></div>
      <div className="grid g2"><GainCalendar /><TimeHeatmap /></div>
      <div className="grid g3"><FeesSummary /><SymbolPerformance /><ImportPanel /></div>
      <PositionsTable />
    </div>
  )
}
