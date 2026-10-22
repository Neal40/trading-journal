export const fmt = (n: number, d = 2) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
export const eur = (n: number) => fmt(n) + '€'
export const fmtDur = (s: number) =>
  s < 60 ? Math.round(s) + 's'
  : s < 3600 ? Math.round(s / 60) + 'm'
  : Math.floor(s / 3600) + 'h ' + Math.round((s % 3600) / 60) + 'm'
export const cls = (n: number) => (n > 0 ? 'pos' : n < 0 ? 'neg' : '')