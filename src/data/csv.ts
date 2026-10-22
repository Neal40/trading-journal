import type { Trade } from '../types'

const HEAD = ['id','openTime','closeTime','symbol','ticket','type','volume','entry','sl','tp','exit','profit','commission','r','mae','mfe']

export function tradesToCsv(trades: Trade[]): string {
  return [HEAD.join(','), ...trades.map(t => HEAD.map(h => (t as any)[h] ?? '').join(','))].join('\n')
}

export function csvToTrades(text: string): Trade[] {
  const [head, ...lines] = text.trim().split(/\r?\n/)
  const cols = head.split(',')
  return lines.filter(Boolean).map((line, i) => {
    const v = line.split(',')
    const o: any = {}
    cols.forEach((c, k) => (o[c] = v[k]))
    const num = (x: any) => (x === '' || x == null ? null : Number(x))
    return {
      id: o.id || 'csv-' + i, openTime: o.openTime, closeTime: o.closeTime || o.openTime,
      symbol: o.symbol, ticket: o.ticket || String(i), type: o.type === 'Buy' ? 'Buy' : 'Sell',
      volume: num(o.volume) ?? 0, entry: num(o.entry) ?? 0, sl: num(o.sl), tp: num(o.tp),
      exit: num(o.exit) ?? 0, profit: num(o.profit) ?? 0, commission: num(o.commission) ?? 0,
      r: num(o.r) ?? 0, mae: num(o.mae) ?? 0, mfe: num(o.mfe) ?? 0, tags: [], images: [],
    } as Trade
  })
}

export function downloadCsv(trades: Trade[]) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([tradesToCsv(trades)], { type: 'text/csv' }))
  a.download = 'trades.csv'
  a.click()
}