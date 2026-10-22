import { useRef } from 'react'
import { Card } from './Card'
import { useStore } from '../store/useStore'
import { csvToTrades, downloadCsv } from '../data/csv'

export default function ImportPanel() {
  const trades = useStore((s) => s.trades)
  const setTrades = useStore((s) => s.setTrades)
  const ref = useRef<HTMLInputElement>(null)

  const onFile = async (file?: File) => {
    if (!file) return
    const text = await file.text()
    setTrades(csvToTrades(text), file.name)
  }

  return (
    <Card title="Données">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => ref.current?.click()}>Importer CSV</button>
        <button className="btn" onClick={() => downloadCsv(trades)}>Exporter CSV</button>
        <button className="btn" onClick={() => setTrades([], 'Aucune donnée')}>Vider</button>
        <button className="btn" disabled title="Bientôt">Import Notion (bientôt)</button>
        <input ref={ref} type="file" accept=".csv" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <p style={{ opacity: 0.6, fontSize: 12, marginTop: 10 }}>{trades.length} trades chargés</p>
    </Card>
  )
}
