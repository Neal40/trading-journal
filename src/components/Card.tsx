import type { ReactNode } from 'react'

export function Card({ title, toolbar, children, className = '' }:
  { title?: string; toolbar?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={'card ' + className}>
      {title && <div className="title">{title}</div>}
      {toolbar && <div className="toolbar">{toolbar}</div>}
      {children}
    </div>
  )
}

export function Seg<T extends string>({ options, value, onChange }:
  { options: { v: T; l: string }[]; value: T; onChange: (v: T) => void }) {
  return <>{options.map(o =>
    <button key={o.v} className={'btn' + (o.v === value ? ' active' : '')} onClick={() => onChange(o.v)}>{o.l}</button>)}</>
}