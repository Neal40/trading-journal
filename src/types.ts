export interface Trade {
  id: string
  openTime: string        // ISO
  closeTime: string       // ISO
  symbol: string
  ticket: string
  type: 'Buy' | 'Sell'
  volume: number
  entry: number
  sl: number | null
  tp: number | null
  exit: number
  profit: number          // en devise
  commission: number
  r: number               // résultat en R
  mae: number             // <= 0 (devise)
  mfe: number             // >= 0 (devise)
  tags: string[]
  images: string[]
}

export type PeriodKey = 'ALL' | '1J' | '1S' | '1M' | '1A'