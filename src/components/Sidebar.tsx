import { useState } from 'react'

export type PageKey = 'comptes' | 'journal' | 'factures'

type Item = { label: string; icon: string; page?: PageKey }
type Group = { id: string; label: string; icon: string; items: Item[] }

const GROUPS: Group[] = [
  {
    id: 'profil', label: 'PROFIL ET SOCIAL', icon: '◉',
    items: [
      { label: 'Comptes', icon: '▦', page: 'comptes' },
      { label: 'Classement', icon: '♛' },
      { label: 'Propfirms / Brokers', icon: '✪' },
      { label: 'Communautés', icon: '⚇' },
    ],
  },
  {
    id: 'labo', label: 'LABORATOIRE', icon: '◍',
    items: [
      { label: 'Graphique', icon: '≈' },
      { label: 'Terminal Economique', icon: '▶' },
      { label: 'Journal de trading', icon: '▮', page: 'journal' },
      { label: 'Simulateur de risque', icon: '≈' },
    ],
  },
  { id: 'quanti', label: 'QUANTITATIVE', icon: '⚗', items: [] },
  { id: 'terminal', label: 'TERMINAL', icon: '▭', items: [] },
  {
    id: 'params', label: 'PARAMÈTRES', icon: '⚙',
    items: [
      { label: 'Profil', icon: '☺' },
      { label: 'Abonnement', icon: '▤' },
      { label: 'Factures', icon: '▯', page: 'factures' },
    ],
  },
  { id: 'support', label: 'SUPPORT', icon: '☊', items: [] },
]

type Props = { page: PageKey; onNavigate: (p: PageKey) => void }

export default function Sidebar({ page, onNavigate }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({
    profil: true, labo: true, params: true,
  })

  const toggleGroup = (id: string) => setOpen(o => ({ ...o, [id]: !o[id] }))

  return (
    <aside className={collapsed ? 'sb collapsed' : 'sb'}>
      <button className="sb-logo" onClick={() => setCollapsed(c => !c)} title="Réduire / agrandir le menu">
        TJ
      </button>

      {!collapsed && (
        <div className="sb-user">
          <div className="sb-avatar">N</div>
          <div><b>Neal</b> <span className="sb-mute">#9365</span></div>
        </div>
      )}

      {!collapsed && <div className="sb-section">MENU PRINCIPAL</div>}

      <nav className="sb-nav">
        {GROUPS.map(g => {
          const isOpen = !!open[g.id]
          return (
            <div key={g.id} className="sb-group">
              <button
                className="sb-group-h"
                onClick={() => (collapsed ? setCollapsed(false) : toggleGroup(g.id))}
                title={collapsed ? g.label : undefined}
              >
                <span className="sb-ico">{g.icon}</span>
                {!collapsed && <span className="sb-group-l">{g.label}</span>}
                {!collapsed && <span className="sb-chev">{isOpen ? '⌄' : '⌃'}</span>}
              </button>

              {!collapsed && isOpen && g.items.map(it => {
                const active = it.page && it.page === page
                const disabled = !it.page
                return (
                  <button
                    key={it.label}
                    className={'sb-item' + (active ? ' active' : '') + (disabled ? ' disabled' : '')}
                    onClick={() => it.page && onNavigate(it.page)}
                    disabled={disabled}
                  >
                    <span className="sb-ico">{it.icon}</span>
                    <span>{it.label}</span>
                  </button>
                )
              })}

              {collapsed && g.items.some(it => it.page === page) && (
                <div className="sb-dot" />
              )}
            </div>
          )
        })}
      </nav>

      {collapsed && (
        <div className="sb-quick">
          {GROUPS.flatMap(g => g.items).filter(it => it.page).map(it => (
            <button
              key={it.label}
              className={'sb-qbtn' + (it.page === page ? ' active' : '')}
              onClick={() => onNavigate(it.page!)}
              title={it.label}
            >
              {it.icon}
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
