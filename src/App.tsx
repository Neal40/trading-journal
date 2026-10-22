import { useState } from 'react'
import Sidebar from './components/Sidebar'
import type { PageKey } from './components/Sidebar'
import ComptesPage from './pages/ComptesPage'
import JournalPage from './pages/JournalPage'
import FacturesPage from './pages/FacturesPage'

export default function App() {
  const [page, setPage] = useState<PageKey>('journal')

  return (
    <div className="layout">
      <Sidebar page={page} onNavigate={setPage} />
      <main className="content">
        {page === 'comptes' && <ComptesPage />}
        {page === 'journal' && <JournalPage />}
        {page === 'factures' && <FacturesPage />}
      </main>
    </div>
  )
}
