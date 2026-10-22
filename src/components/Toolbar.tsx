import { Seg } from './Card'
import { useStore } from '../store/useStore'
import type { PeriodKey } from '../types'

export function Toolbar() {
  const period = useStore(s => s.period)
  const setPeriod = useStore(s => s.setPeriod)
  return (
    <div className="toolbar">
      <Seg<PeriodKey>
        value={period}
        onChange={setPeriod}
        options={[
          { v: '1J', l: '1J' },
          { v: '1S', l: '1S' },
          { v: '1M', l: '1M' },
          { v: '1A', l: '1A' },
          { v: 'ALL', l: 'ALL' },
        ]}
      />
    </div>
  )
}

export { Seg }
