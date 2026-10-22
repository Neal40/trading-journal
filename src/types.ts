export interface Trade {
  id: string
  openTime: string
  closeTime: string
  symbol: string
  ticket: string
  type: 'Buy' | 'Sell'
  volume: number
  entry: number
  sl: number | null
  tp: number | null
  exit: number
  profit: number
  commission: number
  r: number
  mae: number
  mfe: number
  tags: string[]
  images: string[]
  reasons: string[]
  rulesRespected: boolean | null
  comment: string
  accountId?: string
}

export type PeriodKey = 'ALL' | '1J' | '1S' | '1M' | '1A'

export type AccountType = 'Funded' | 'Challenge' | 'Paper' | 'Review' | 'Backtest'

export interface Account {
  id: string
  name: string
  type: AccountType
  size: number
  startBalance: number
  firm?: string
  login?: string
  ordre?: number
  archived?: boolean
}

export type EcritureNature = 'Challenge' | 'Reset' | 'Activation' | 'Autres frais' | 'Payout' | 'Remboursement'

export const NATURES: EcritureNature[] = ['Challenge', 'Reset', 'Activation', 'Autres frais', 'Payout', 'Remboursement']

export interface Ecriture {
  id: string
  nature: EcritureNature
  date: string
  accountId: string
  firm: string
  montant: number
  devise: string
  note: string
}

export const ALL_ACCOUNT_ID = 'all'

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
