import KpiRow from './components/KpiRow'
import PerformanceChart from './components/PerformanceChart'
import SocialRadar from './components/SocialRadar'
import DrawdownChart from './components/DrawdownChart'
import RewardRisk from './components/RewardRisk'
import DurationScatter from './components/DurationScatter'
import WinrateGauge from './components/WinrateGauge'
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
import { useStore } from './store/useStore'
import { generateDemo } from './data/demo'
import { useEffect } from 'react'
import './lib/chart'

export default function App() {
  const { trades, setTrades } = useStore()
  useEffect(() => { if (trades.length === 0) setTrades(generateDemo()) }, [])

  return (
    <div className="app">
      <header className="top">
        <h1>Trading Journal</h1>
      </header>
      <KpiRow />
      <div className="grid g2"><PerformanceChart /><SocialRadar /></div>
      <div className="grid g3"><DrawdownChart /><RewardRisk /><WinrateGauge /></div>
      <div className="grid g2"><ReturnChart /><DurationScatter /></div>
      <div className="grid g3"><RiskDistribution /><SharpePanel /><MaeMfeChart /></div>
      <div className="grid g2"><GainCalendar /><TimeHeatmap /></div>
      <div className="grid g3"><FeesSummary /><SymbolPerformance /><ImportPanel /></div>
      <PositionsTable />
    </div>
  )
}