import { useStore } from '../store/useStore'
import { computeStats, filterPeriod } from '../lib/stats'
import { ALL_ACCOUNT_ID } from '../types'
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
import Calendar from '../components/Calendar'
import PositionsTable from '../components/PositionsTable'
import TimeHeatmap from '../components/TimeHeatmap'
import SymbolPerformance from '../components/SymbolPerformance'
import FeesSummary from '../components/FeesSummary'

export default function JournalPage() {
  const trades = useStore(s => s.trades)
  const period = useStore(s => s.period)
  const label = useStore(s => s.sourceLabel)
  const accounts = useStore(s => s.accounts)
  const activeId = useStore(s => s.activeAccountId)
  const setActive = useStore(s => s.setActiveAccount)

  const scoped = activeId === ALL_ACCOUNT_ID
    ? trades
    : trades.filter(t => t.accountId === activeId || (!t.accountId && activeId === 'default'))
  const s = computeStats(filterPeriod(scoped, period))

  const active = accounts.find(a => a.id === activeId)
  const title = activeId === ALL_ACCOUNT_ID ? 'Devises mixtes' : active?.name ?? label
  const subtitle = activeId === ALL_ACCOUNT_ID ? 'All Data' : active?.firm ?? active?.type ?? ''

  const switchAccount = () => {
    const ids = [ALL_ACCOUNT_ID, ...accounts.map(a => a.id)]
    const next = ids[(ids.indexOf(activeId) + 1) % ids.length]
    setActive(next)
  }

  return (
    <section className="journal">
      <div className="acct">
        <div className="acct-ico">🏛</div>
        <div className="acct-info">
          <div><b>{title}</b> <span className="sb-mute">{subtitle}</span></div>
          {active?.login && <div className="sb-mute" style={{ fontSize: 12 }}>Login : {active.login}</div>}
          <div className="sb-mute" style={{ fontSize: 12 }}>{s.n} positions</div>
        </div>
        <button className="btn-blue" onClick={switchAccount}>Changer de compte</button>
      </div>

      <div className="page-actions right">
        <button className="btn">Rapport PDF</button>
        <Toolbar />
      </div>

      <KpiRow s={s} />

      <div className="grid g-main">
        <PerformanceChart s={s} />
        <SocialRadar s={s} />
      </div>

      <PositionsTable />

      <div className="grid g-main">
        <WinrateGauge s={s} />
        <ReturnChart s={s} />
      </div>

      <div className="grid g-main">
        <DrawdownChart s={s} />
        <RewardRisk s={s} />
      </div>

      <div className="grid g-side">
        <SharpePanel s={s} />
        <MaeMfeChart s={s} />
      </div>

      <RiskDistribution s={s} />

      <div className="grid g-half">
        <Calendar />
        <TimeHeatmap />
      </div>

      <div className="grid g-half">
        <FeesSummary />
        <SymbolPerformance />
      </div>

      <DurationScatter s={s} />
    </section>
  )
}
