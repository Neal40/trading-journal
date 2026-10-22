import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { ALL_ACCOUNT_ID, NATURES } from '../types'
import type { Account, AccountType, EcritureNature, Trade, Ecriture } from '../types'
import type { PageKey } from '../components/Sidebar'

const WARN_DAYS = 23
const INACTIVE_DAYS = 30
const ALERT_DAYS_LEFT = 3
const DAY = 86400000

const FIRMS = ['Apex', 'Topstep'] as const
const ACCOUNT_TYPES: AccountType[] = ['Funded', 'Challenge', 'Paper', 'Review', 'Backtest']
const SIZES = [25000, 50000, 100000, 150000, 300000]

type Tab = 'Tous' | 'Actifs' | 'Bientôt inactifs' | 'Inactifs'
type Status = 'actif' | 'bientot' | 'inactif'

function lastTradeTime(trades: Trade[]): number | null {
  if (!trades.length) return null
  return Math.max(...trades.map(t => +new Date(t.closeTime)))
}

function statusOf(last: number | null, now: number): { status: Status; daysSince: number | null; daysLeft: number | null } {
  if (last === null) return { status: 'inactif', daysSince: null, daysLeft: 0 }
  const daysSince = (now - last) / DAY
  const daysLeft = Math.max(0, INACTIVE_DAYS - daysSince)
  if (daysSince >= INACTIVE_DAYS) return { status: 'inactif', daysSince, daysLeft: 0 }
  if (daysSince >= WARN_DAYS) return { status: 'bientot', daysSince, daysLeft }
  return { status: 'actif', daysSince, daysLeft }
}

// Dépenses = Challenge, Reset, Activation, Autres frais
const DEPENSE_NATURES: EcritureNature[] = ['Challenge', 'Reset', 'Activation', 'Autres frais']
const ENCAISSE_NATURES: EcritureNature[] = ['Remboursement', 'Payout']

interface Props {
  onNavigate: (p: PageKey) => void
}

export default function ComptesPage({ onNavigate }: Props) {
  const accounts = useStore(s => s.accounts)
  const trades = useStore(s => s.trades)
  const ecritures = useStore(s => s.ecritures)
  const activeId = useStore(s => s.activeAccountId)
  const setActive = useStore(s => s.setActiveAccount)
  const addAccount = useStore(s => s.addAccount)
  const moveAccount = useStore(s => s.moveAccount)
  const toggleArchive = useStore(s => s.toggleArchive)
  const addEcriture = useStore(s => s.addEcriture)
  const removeEcriture = useStore(s => s.removeEcriture)
  const [tab, setTab] = useState<Tab>('Tous')
  const [showAdd, setShowAdd] = useState(false)
  const [showEcriture, setShowEcriture] = useState(false)

  const now = Date.now()

  const rows = useMemo(() => accounts.map(a => {
    const own = trades.filter(t => t.accountId === a.id || (!t.accountId && a.id === 'default'))
    const last = lastTradeTime(own)
    const computed = statusOf(last, now)
    const status: Status = a.archived ? 'inactif' : computed.status
    return { account: a, trades: own, ...computed, status }
  }), [accounts, trades, now])

  const filtered = rows.filter(r =>
    tab === 'Tous' ? true :
    tab === 'Actifs' ? r.status === 'actif' :
    tab === 'Bientôt inactifs' ? r.status === 'bientot' :
    r.status === 'inactif'
  )

  const counts = {
    Tous: rows.length,
    Actifs: rows.filter(r => r.status === 'actif').length,
    'Bientôt inactifs': rows.filter(r => r.status === 'bientot').length,
    Inactifs: rows.filter(r => r.status === 'inactif').length,
  }

  const allTrades = trades
  const wins = allTrades.filter(t => t.profit > 0).length
  const losses = allTrades.filter(t => t.profit < 0).length
  const winrate = allTrades.length ? (wins / allTrades.length) * 100 : 0
  const totalProfit = allTrades.reduce((s, t) => s + t.profit, 0)
  const startTotal = accounts.reduce((s, a) => s + a.startBalance, 0)
  const rendement = startTotal ? (totalProfit / startTotal) * 100 : 0
  const actifsCount = rows.filter(r => r.status === 'actif').length
  const inactifsCount = rows.length - actifsCount

  const sumNature = (natures: EcritureNature[]) =>
    ecritures.filter(e => natures.includes(e.nature)).reduce((s, e) => s + e.montant, 0)
  const depenses = -Math.abs(sumNature(DEPENSE_NATURES))
  const gainReel = sumNature(['Remboursement'])
  const gainsRetires = sumNature(['Payout'])

  // Rentabilité globale
  const depense = Math.abs(depenses)
  const encaisse = sumNature(ENCAISSE_NATURES)
  const beneficeNet = encaisse - depense
  const rentabilite = depense ? (beneficeNet / depense) * 100 : 0

  // Rentabilité par firme
  const firmRows = useMemo(() => {
    const map = new Map<string, { depense: number; encaisse: number }>()
    ecritures.forEach(e => {
      const cur = map.get(e.firm) ?? { depense: 0, encaisse: 0 }
      if (DEPENSE_NATURES.includes(e.nature)) cur.depense += Math.abs(e.montant)
      if (ENCAISSE_NATURES.includes(e.nature)) cur.encaisse += e.montant
      map.set(e.firm, cur)
    })
    return Array.from(map.entries()).map(([firm, v]) => ({
      firm,
      ...v,
      net: v.encaisse - v.depense,
      rent: v.depense ? ((v.encaisse - v.depense) / v.depense) * 100 : 0,
    }))
  }, [ecritures])

  const openAllData = () => {
    setActive(ALL_ACCOUNT_ID)
    onNavigate('journal')
  }

  const accountName = (id: string) => accounts.find(a => a.id === id)?.name ?? '—'

  const exportCsv = () => {
    const header = ['Date', 'Nature', 'Compte', 'Firme', 'Montant', 'Devise', 'Note']
    const lines = ecritures.map(e => [e.date, e.nature, accountName(e.accountId), e.firm, e.montant, e.devise, e.note]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
    const blob = new Blob([[header.join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rentabilite.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="comptes">
      <div className="alldata-wrap">
        <div className="alldata">
          <div className="alldata-title">Compte All-Data</div>
          <div className="alldata-card">
            <div className="alldata-head">
              <div className="alldata-ico">🏛</div>
              <div>
                <div className="alldata-name">Devises mixtes</div>
                <div className="alldata-sub">{actifsCount} compte(s) actif(s) / {inactifsCount} inactif(s)</div>
              </div>
            </div>
            <div className="alldata-rows">
              <div className="alldata-row"><span>Nombre de positions</span><span>{allTrades.length}</span></div>
              <div className="alldata-row"><span>Positions gagnantes</span><span className="pos">{wins}</span></div>
              <div className="alldata-row"><span>Positions perdantes</span><span className="neg">{losses}</span></div>
              <div className="alldata-row"><span>Winrate</span><span>{winrate.toFixed(2)} %</span></div>
              <div className="alldata-sep" />
              <div className={`alldata-row bold ${rendement >= 0 ? 'pos' : 'neg'}`}><span>Rendement</span><span>{rendement >= 0 ? '+' : ''}{rendement.toFixed(2)} %</span></div>
            </div>
          </div>
          <div className="alldata-foot">
            <button className="btn-blue" onClick={openAllData}>Voir toutes mes performances</button>
          </div>
        </div>

        <div className="alldata">
          <div className="acct-tabs">
            {(Object.keys(counts) as Tab[]).map(k => (
              <button key={k} className={`acct-tab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>
                {k} ({counts[k]})
              </button>
            ))}
          </div>
          <div className="acct-grid">
            {filtered.map(r => (
              <AccountCard
                key={r.account.id}
                account={r.account}
                pnl={r.trades.reduce((s, t) => s + t.profit, 0)}
                status={r.status}
                daysLeft={r.daysLeft}
                isActive={activeId === r.account.id}
                onSelect={() => setActive(r.account.id)}
                onMoveUp={() => moveAccount(r.account.id, 'up')}
                onMoveDown={() => moveAccount(r.account.id, 'down')}
                onArchive={() => toggleArchive(r.account.id)}
              />
            ))}
            <button className="acct-add" onClick={() => setShowAdd(true)}>
              <span className="plus">+</span>
              Ajouter un nouveau compte
            </button>
          </div>
        </div>
      </div>

      <div className="alldata">
        <div className="rent-head">
          <h3>Profitabilité totale</h3>
        </div>
        <div className="profit-kpis">
          <div className="kpi"><div className="kpi-label">Dépenses prop firm</div><div className="kpi-value neg">{depenses.toFixed(2)} $</div></div>
          <div className="kpi"><div className="kpi-label">Gain en compte réel</div><div className="kpi-value">{gainReel.toFixed(2)} $</div></div>
          <div className="kpi"><div className="kpi-label">Réussite des challenges</div><div className="kpi-value">0 %</div></div>
          <div className="kpi"><div className="kpi-label">Gains retirés</div><div className="kpi-value">{gainsRetires.toFixed(2)} $</div></div>
          <div className="kpi hl"><div className="kpi-label">Résultat net</div><div className={`kpi-value ${totalProfit >= 0 ? 'pos' : 'neg'}`}>{totalProfit.toFixed(2)} $</div></div>
        </div>
      </div>

      <div className="alldata">
        <div className="rent-head">
          <h3>Rentabilité</h3>
          <div className="rent-actions">
            <button className="btn" onClick={exportCsv}>Exporter en CSV</button>
            <button className="btn-blue" onClick={() => setShowEcriture(true)}>+ Ajouter</button>
          </div>
        </div>
        <div className="profit-kpis">
          <div className="kpi"><div className="kpi-label">Dépensé</div><div className="kpi-value">{depense.toFixed(2)} $</div></div>
          <div className="kpi"><div className="kpi-label">Encaissé</div><div className="kpi-value">{encaisse.toFixed(2)} $</div></div>
          <div className="kpi"><div className="kpi-label">Bénéfice net</div><div className={`kpi-value ${beneficeNet >= 0 ? 'pos' : 'neg'}`}>{beneficeNet.toFixed(2)} $</div></div>
          <div className="kpi"><div className="kpi-label">Rentabilité</div><div className={`kpi-value ${rentabilite >= 0 ? 'pos' : 'neg'}`}>{rentabilite.toFixed(0)} %</div></div>
        </div>

        <div className="rent-head"><h3>Par firme</h3></div>
        <table className="ecritures-table">
          <thead>
            <tr>
              <th>Firme</th>
              <th className="r">Dépensé</th>
              <th className="r">Encaissé</th>
              <th className="r">Bénéfice net</th>
              <th className="r">Rentabilité</th>
            </tr>
          </thead>
          <tbody>
            {firmRows.map(f => (
              <tr key={f.firm}>
                <td>{f.firm}</td>
                <td className="r">{f.depense.toFixed(2)} $</td>
                <td className="r">{f.encaisse.toFixed(2)} $</td>
                <td className={`r ${f.net >= 0 ? 'pos' : 'neg'}`}>{f.net.toFixed(2)} $</td>
                <td className={`r ${f.rent >= 0 ? 'pos' : 'neg'}`}>{f.rent.toFixed(0)} %</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="rent-head"><h3>Écritures</h3></div>
        {ecritures.length > 0 ? (
          <table className="ecritures-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Nature</th>
                <th>Firme</th>
                <th>Compte</th>
                <th className="r">Montant</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...ecritures].sort((a, b) => b.date.localeCompare(a.date)).map((e: Ecriture) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.nature}</td>
                  <td>{e.firm}</td>
                  <td>{accountName(e.accountId)}</td>
                  <td className={`r ${e.montant >= 0 ? 'pos' : 'neg'}`}>{e.montant.toFixed(2)} {e.devise === 'EUR' ? '€' : '$'}</td>
                  <td>{e.note}</td>
                  <td>
                    <button className="btn" title="Modifier (à venir)" disabled>✎</button>
                    <button className="btn" title="Supprimer" onClick={() => {
                      if (window.confirm('Supprimer cette écriture ?')) removeEcriture(e.id)
                    }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="kpi-foot">0 écriture(s) enregistrée(s)</div>
        )}
      </div>

      {showAdd && (
        <AddAccountModal
          onClose={() => setShowAdd(false)}
          onSave={(a) => {
            addAccount(a)
            setShowAdd(false)
          }}
        />
      )}

      {showEcriture && (
        <EcritureModal
          accounts={accounts}
          defaultAccountId={activeId}
          onClose={() => setShowEcriture(false)}
          onSave={(e) => {
            addEcriture(e)
            setShowEcriture(false)
          }}
        />
      )}
    </section>
  )
}

function AddAccountModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (a: Omit<Account, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [firm, setFirm] = useState<string>('Apex')
  const [login, setLogin] = useState('')
  const [type, setType] = useState<AccountType>('Challenge')
  const [size, setSize] = useState<number>(50000)

  const canSave = name.trim().length > 0

  const submit = () => {
    if (!canSave) return
    onSave({
      name: name.trim(),
      firm,
      login: login.trim() || undefined,
      type,
      size,
      startBalance: size,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">Nouveau compte</div>
        <div className="modal-body">
          <div className="modal-field full">
            <label>Nom du compte</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Topstep 50k #1" />
          </div>
          <div className="modal-field">
            <label>Firme</label>
            <select className="input" value={firm} onChange={e => setFirm(e.target.value)}>
              {FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="modal-field">
            <label>Login</label>
            <input className="input" value={login} onChange={e => setLogin(e.target.value)} placeholder="Optionnel" />
          </div>
          <div className="modal-field">
            <label>Type</label>
            <select className="input" value={type} onChange={e => setType(e.target.value as AccountType)}>
              {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="modal-field">
            <label>Taille du compte</label>
            <select className="input" value={size} onChange={e => setSize(Number(e.target.value))}>
              {SIZES.map(s => <option key={s} value={s}>{s.toLocaleString('fr-FR')} $</option>)}
            </select>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn-blue" onClick={submit} disabled={!canSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

function EcritureModal({ accounts, defaultAccountId, onClose, onSave }: {
  accounts: Account[]
  defaultAccountId: string
  onClose: () => void
  onSave: (e: { nature: EcritureNature; date: string; accountId: string; firm: string; montant: number; devise: string; note: string }) => void
}) {
  const initialAccount = accounts.find(a => a.id === defaultAccountId) ?? accounts[0]
  const [nature, setNature] = useState<EcritureNature>('Challenge')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [accountId, setAccountId] = useState<string>(initialAccount?.id ?? '')
  const [firm, setFirm] = useState<string>(initialAccount?.firm ?? 'Apex')
  const [montant, setMontant] = useState<string>('')
  const [devise, setDevise] = useState('USD')
  const [note, setNote] = useState('')

  const montantNum = Number(montant.replace(',', '.'))
  const canSave = accountId !== '' && montant.trim() !== '' && !Number.isNaN(montantNum)

  const onAccountChange = (id: string) => {
    setAccountId(id)
    const acc = accounts.find(a => a.id === id)
    if (acc?.firm) setFirm(acc.firm)
  }

  const submit = () => {
    if (!canSave) return
    onSave({ nature, date, accountId, firm, montant: montantNum, devise, note: note.trim() })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">Nouvelle écriture</div>
        <div className="modal-body">
          <div className="modal-field">
            <label>Nature</label>
            <select className="input" value={nature} onChange={e => setNature(e.target.value as EcritureNature)}>
              {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="modal-field">
            <label>Date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="modal-field">
            <label>Compte</label>
            <select className="input" value={accountId} onChange={e => onAccountChange(e.target.value)}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="modal-field">
            <label>Firme</label>
            <select className="input" value={firm} onChange={e => setFirm(e.target.value)}>
              {FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="modal-field">
            <label>Montant</label>
            <input className="input" value={montant} onChange={e => setMontant(e.target.value)} placeholder="Ex : 165 ou -165" inputMode="decimal" />
          </div>
          <div className="modal-field">
            <label>Devise</label>
            <select className="input" value={devise} onChange={e => setDevise(e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div className="modal-field full">
            <label>Note</label>
            <textarea className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Optionnel" rows={3} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn-blue" onClick={submit} disabled={!canSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

function AccountCard({ account, pnl, status, daysLeft, isActive, onSelect, onMoveUp, onMoveDown, onArchive }: {
  account: Account
  pnl: number
  status: Status
  daysLeft: number | null
  isActive: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onArchive: () => void
}) {
  const dot = status === 'actif' ? '#2ecc71' : status === 'bientot' ? '#f1c40f' : '#7f8c8d'
  const showAlert = status === 'bientot' && daysLeft !== null && daysLeft <= ALERT_DAYS_LEFT
  return (
    <div className="acct-row">
      <div className={isActive ? 'acct-card active' : 'acct-card'} onClick={onSelect}>
        <div className="acct-card-top">
          <div className="acct-card-ico">🏦</div>
          <div className="acct-card-main">
            <div className="acct-card-bal">{account.size.toLocaleString('fr-FR')} $</div>
            <div className="acct-card-sub">{account.name}{account.login ? ` · ${account.login}` : ''}</div>
          </div>
          <span className="acct-card-dot" style={{ background: dot }} />
        </div>
        <div className="acct-card-foot">
          <span className="acct-card-status">{account.firm ?? account.type}</span>
          <span className={pnl >= 0 ? 'pos' : 'neg'}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} $</span>
        </div>
        {showAlert && (
          <div className="note">⚠ Inactivité dans {Math.ceil(daysLeft!)} jour(s) — prends une position</div>
        )}
      </div>
      <div className="acct-card-actions" onClick={e => e.stopPropagation()}>
        <button className="acct-side-btn" onClick={onMoveUp} title="Monter">↑</button>
        <button className="acct-side-btn" onClick={onMoveDown} title="Descendre">↓</button>
        <button className="acct-side-btn" onClick={onArchive} title={account.archived ? 'Désarchiver' : 'Archiver'}>{account.archived ? '↺' : '🗄'}</button>
      </div>
    </div>
  )
}
