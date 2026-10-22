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

// Dépenses = Challenge, Reset, Activation, Autres frais (négatif)
const DEPENSE_NATURES: EcritureNature[] = ['Challenge', 'Reset', 'Activation', 'Autres frais']

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
  const addEcriture = useStore(s => s.addEcriture)
  const removeEcriture = useStore(s => s.removeEcriture)
  const [tab, setTab] = useState<Tab>('Tous')
  const [showAdd, setShowAdd] = useState(false)
  const [showEcriture, setShowEcriture] = useState(false)

  const now = Date.now()

  const rows = useMemo(() => accounts.map(a => {
    const own = trades.filter(t => t.accountId === a.id || (!t.accountId && a.id === 'default'))
    const last = lastTradeTime(own)
    return { account: a, trades: own, ...statusOf(last, now) }
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

  // Profitabilité totale, calculée sur les écritures
  const sumNature = (natures: EcritureNature[]) =>
    ecritures.filter(e => natures.includes(e.nature)).reduce((s, e) => s + e.montant, 0)
  const depenses = -Math.abs(sumNature(DEPENSE_NATURES))
  const gainReel = sumNature(['Remboursement'])
  const gainsRetires = sumNature(['Payout'])

  const openAllData = () => {
    setActive(ALL_ACCOUNT_ID)
    onNavigate('journal')
  }

  const accountName = (id: string) => accounts.find(a => a.id === id)?.name ?? '—'

  return (
    <section className="comptes">
      <div className="comptes-top">
        <div className="card alldata">
          <h3>COMPTE ALL-DATA</h3>
          <div className="alldata-head">
            <div className="alldata-ico">🏛</div>
            <div>
              <div className="alldata-name">Devises mixtes</div>
              <div className="sb-mute">{actifsCount} compte(s) actif(s) / {inactifsCount} inactif(s)</div>
            </div>
          </div>
          <div className="kv"><span>Nombre de positions</span><b>{allTrades.length}</b></div>
          <div className="kv"><span>Positions gagnantes</span><b className="pos">{wins}</b></div>
          <div className="kv"><span>Positions perdantes</span><b className="neg">{losses}</b></div>
          <div className="kv"><span>Winrate</span><b>{winrate.toFixed(2)} %</b></div>
          <div className="kv"><span>Rendement</span><b className={rendement >= 0 ? 'pos' : 'neg'}>{rendement >= 0 ? '+' : ''}{rendement.toFixed(2)} %</b></div>
          <button className="btn-blue full" onClick={openAllData}>Voir toutes mes performances</button>
        </div>

        <div className="card">
          <div className="tabs">
            {(Object.keys(counts) as Tab[]).map(k => (
              <button key={k} className={tab === k ? 'tab active' : 'tab'} onClick={() => setTab(k)}>
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
              />
            ))}
            <button className="acct-add" onClick={() => setShowAdd(true)}>
              + Ajouter un nouveau compte
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>PROFITABILITÉ TOTALE</h3>
          <button className="btn-blue" onClick={() => setShowEcriture(true)}>+ Nouvelle écriture</button>
        </div>
        <div className="kpi-row">
          <div className="kpi"><span>Dépenses prop firm</span><b className="neg">{depenses.toFixed(2)} $</b></div>
          <div className="kpi"><span>Gain en compte réel</span><b>{gainReel.toFixed(2)} $</b></div>
          <div className="kpi"><span>Réussite des challenges</span><b>0 %</b></div>
          <div className="kpi"><span>Gains retirés</span><b>{gainsRetires.toFixed(2)} $</b></div>
          <div className="kpi hl"><span>Résultat net</span><b className={totalProfit >= 0 ? 'pos' : 'neg'}>{totalProfit.toFixed(2)} $</b></div>
        </div>

        <div className="sb-mute">{ecritures.length} écriture(s) enregistrée(s)</div>
        {ecritures.length > 0 && (
          <table className="ecritures-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Nature</th>
                <th>Compte</th>
                <th>Firme</th>
                <th>Montant</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...ecritures].sort((a, b) => b.date.localeCompare(a.date)).map((e: Ecriture) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.nature}</td>
                  <td>{accountName(e.accountId)}</td>
                  <td>{e.firm}</td>
                  <td className={e.montant >= 0 ? 'pos' : 'neg'}>{e.montant.toFixed(2)} {e.devise === 'EUR' ? '€' : '$'}</td>
                  <td>{e.note}</td>
                  <td>
                    <button className="btn-ghost" onClick={() => {
                      if (window.confirm('Supprimer cette écriture ?')) removeEcriture(e.id)
                    }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Nouveau compte</h3>
        </div>
        <div className="modal-body">
          <label className="field">
            <span>Nom du compte</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Topstep 50k #1" />
          </label>
          <label className="field">
            <span>Firme</span>
            <select value={firm} onChange={e => setFirm(e.target.value)}>
              {FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Login</span>
            <input value={login} onChange={e => setLogin(e.target.value)} placeholder="Optionnel" />
          </label>
          <label className="field">
            <span>Type</span>
            <select value={type} onChange={e => setType(e.target.value as AccountType)}>
              {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Taille du compte</span>
            <select value={size} onChange={e => setSize(Number(e.target.value))}>
              {SIZES.map(s => <option key={s} value={s}>{s.toLocaleString('fr-FR')} $</option>)}
            </select>
          </label>
        </div>
        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Nouvelle écriture</h3>
        </div>
        <div className="modal-body">
          <label className="field">
            <span>Nature</span>
            <select value={nature} onChange={e => setNature(e.target.value as EcritureNature)}>
              {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>Compte</span>
            <select value={accountId} onChange={e => onAccountChange(e.target.value)}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Firme</span>
            <select value={firm} onChange={e => setFirm(e.target.value)}>
              {FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Montant</span>
            <input value={montant} onChange={e => setMontant(e.target.value)} placeholder="Ex : 165 ou -165" inputMode="decimal" />
          </label>
          <label className="field">
            <span>Devise</span>
            <select value={devise} onChange={e => setDevise(e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </label>
          <label className="field">
            <span>Note</span>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optionnel" rows={3} />
          </label>
        </div>
        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn-blue" onClick={submit} disabled={!canSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

function AccountCard({ account, pnl, status, daysLeft, isActive, onSelect }: {
  account: Account
  pnl: number
  status: Status
  daysLeft: number | null
  isActive: boolean
  onSelect: () => void
}) {
  const dot = status === 'actif' ? '#2ecc71' : status === 'bientot' ? '#f1c40f' : '#7f8c8d'
  const showAlert = status === 'bientot' && daysLeft !== null && daysLeft <= ALERT_DAYS_LEFT
  return (
    <div className={isActive ? 'acct-card active' : 'acct-card'} onClick={onSelect}>
      <div className="acct-card-head">
        <span className="dot" style={{ background: dot }} />
        <b>{account.name}</b>
      </div>
      <div className="sb-mute">{account.firm ?? account.type}{account.login ? ` · ${account.login}` : ''}</div>
      <div>{account.size.toLocaleString('fr-FR')} $</div>
      <div className={pnl >= 0 ? 'pos' : 'neg'}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} $</div>
      {showAlert && (
        <div className="alert">⚠ Inactivité dans {Math.ceil(daysLeft!)} jour(s) — prends une position</div>
      )}
    </div>
  )
}
