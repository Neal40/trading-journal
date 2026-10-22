import { useState } from 'react'
import ComptesPage from './pages/ComptesPage'
import JournalPage from './pages/JournalPage'
import FacturesPage from './pages/FacturesPage'

type PageKey = 'comptes' | 'journal' | 'factures'

const MENU: { key: PageKey; label: string }[] = [
  { key: 'comptes', label: 'Comptes' },
  { key: 'journal', label: 'Journal de trading' },
  { key: 'factures', label: 'Factures' },
]

export default function App() {
  const [page, setPage] = useState<PageKey>('journal')

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">TJ</div>
        <div className="menu-title">MENU PRINCIPAL</div>
        <nav>
          {MENU.map(item => (
            <button
              key={item.key}
              className={page === item.key ? 'menu-item active' : 'menu-item'}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">
        {page === 'comptes' && <ComptesPage />}
        {page === 'journal' && <JournalPage />}
        {page === 'factures' && <FacturesPage />}
      </main>
    </div>
  )
}
