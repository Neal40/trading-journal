import { useRef } from 'react'
import Card from './Card'
import { useStore } from '../store/useStore'
import { parseCsv, exportCsv } from '../data/csv'
import { generateDemo } from '../data/demo'

export default function ImportPanel() {
  const { trades, setTrades } = useStore()
  const ref = useRef<HTMLInputElement>(null)

  const onFile = async (file?: File) => {
    if (!file) return
    const text = await file.text()
    setTrades(parseCsv(text))
  }

  const download = () => {
    const blob = new Blob([exportCsv(trades)], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'journal.csv'
    a.click()
  }

  return (
    <Card title="Données">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => ref.current?.click()}>Importer CSV</button>
        <button className="btn" onClick={download}>Exporter CSV</button>
        <button className="btn" onClick={() => setTrades(generateDemo())}>Données démo</button>
        <button className="btn" onClick={() => setTrades([])}>Vider</button>
        <button className="btn" disabled title="Bientôt">Import Notion (bientôt)</button>
        <input ref={ref} type="file" accept=".csv" hidden onChange={e => onFile(e.target.files?.[0])} />
      </div>
      <p style={{ opacity: .6, fontSize: 12, marginTop: 10 }}>{trades.length} trades chargés</p>
    </Card>
  )
}