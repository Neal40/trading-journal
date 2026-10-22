import { useState } from 'react'
import { Scatter } from 'react-chartjs-2'
import { Card, Seg } from './Card'
import type { Stats } from '../lib/stats'
import { baseOpts, grid } from '../lib/chart'
import { eur } from '../lib/format'

export function MaeMfeChart({ s }: { s: Stats }) {
  const [mode, setMode] = useState<'MAE' | 'MFE'>('MAE')
  const [zones, setZones] = useState('on')
  const avgLoss = -s.avgL
  const pts = s.sorted.map(t => ({ x: t.profit, y: mode === 'MAE' ? t.mae : t.mfe, w: t.profit > 0 }))

  const zonePlugin = {
    id: 'z',
    beforeDraw(c: any) {
      if (zones !== 'on' || mode !== 'MAE') return
      const { ctx, chartArea: a, scales: { y } } = c
      const ly = y.getPixelForValue(avgLoss)
      ctx.save()
      ctx.fillStyle = 'rgba(20,80,40,.25)'; ctx.fillRect(a.left, a.top, a.right - a.left, ly - a.top)
      ctx.fillStyle = 'rgba(90,25,25,.3)'; ctx.fillRect(a.left, ly, a.right - a.left, a.bottom - ly)
      ctx.strokeStyle = '#888'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(a.left, ly); ctx.lineTo(a.right, ly); ctx.stroke()
      ctx.setLineDash([]); ctx.fillStyle = '#888'
      ctx.fillText('Dans la perte moyenne', a.left + 8, a.top + 14)
      ctx.fillText('Au-delà de la perte moyenne', a.left + 8, ly + 14)
      ctx.restore()
    },
  }
  return (
    <Card title="Maximum Adverse Excursion - Maximum Favorable Excursion" toolbar={<>
      <select value={mode} onChange={e => setMode(e.target.value as any)}><option>MAE</option><option>MFE</option></select>
      <span className="muted">Zones de gestion</span>
      <Seg value={zones} onChange={setZones} options={[{ v: 'on', l: 'Affichées' }, { v: 'off', l: 'Masquées' }]} />
    </>}>
      <div className="chartbox" style={{ height: 330, marginTop: 30 }}>
        <Scatter plugins={[zonePlugin]} options={{ ...baseOpts, scales: { x: { grid }, y: { grid } } } as any}
          data={{ datasets: [{ data: pts, pointRadius: 5, backgroundColor: pts.map(p => p.w ? '#e8f5ec' : '#ef5350') }] }} />
      </div>
      <div className="note">Pointillé à {eur(avgLoss)} (perte moyenne du compte) : au-dessus, le trade n'a jamais été plus loin contre vous que la perte moyenne ; en dessous, il l'a dépassée en cours de route.</div>
    </Card>
  )
}