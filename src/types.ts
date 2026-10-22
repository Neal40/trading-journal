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
  reasons: string[]                 // raisons hors plan
  rulesRespected: boolean | null    // règles respectées (OUI / NON)
  comment: string                   // commentaire libre
  accountId?: string                // compte auquel appartient le trade
}

export type PeriodKey = 'ALL' | '1J' | '1S' | '1M' | '1A'

export type AccountType = 'Funded' | 'Challenge' | 'Paper' | 'Review' | 'Backtest'

export interface Account {
  id: string
  name: string            // ex. "Topstep 50k"
  type: AccountType
  size: number            // taille du compte en devise, ex. 50000
  startBalance: number    // solde de départ utilisé pour les stats
}

export const REASONS = [
  'FOMO',
  'Revenge trade',
  'Taille de position',
  'Hors macro',
  'Setup non A+',
  'News majeure',
  'Stop déplacé',
  'Sortie anticipée',
  "Oubli d'un élément clé",
  'Autre',
] as const
