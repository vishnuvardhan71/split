import type { Member, Settlement } from '../types'
import { formatCurrency } from '../utils/calculations'

type Props = {
  members: Member[]
  settlements: Settlement[]
  hasExpenses: boolean
}

export function SettlementPanel({ members, settlements, hasExpenses }: Props) {
  const nameById = Object.fromEntries(members.map((m) => [m.id, m.name]))

  return (
    <section className="rounded-2xl border border-border bg-surface-raised p-5 shadow-lg">
      <h2 className="text-lg font-semibold text-text">Settle Up</h2>
      <p className="mt-1 text-sm text-text-muted">
        Minimum payments to clear all debts
      </p>

      {!hasExpenses ? (
        <p className="mt-6 text-center text-sm text-text-muted">
          Add expenses to see settlement plan
        </p>
      ) : settlements.length === 0 ? (
        <div className="mt-6 rounded-xl border border-positive/30 bg-positive/10 px-4 py-5 text-center">
          <p className="font-semibold text-positive">All settled!</p>
          <p className="mt-1 text-sm text-text-muted">No payments needed</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {settlements.map((s, i) => (
            <li
              key={`${s.fromId}-${s.toId}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
                {i + 1}
              </span>
              <p className="text-sm text-text">
                <span className="font-semibold text-negative">
                  {nameById[s.fromId]}
                </span>{' '}
                pays{' '}
                <span className="font-semibold text-positive">
                  {nameById[s.toId]}
                </span>{' '}
                <span className="font-bold text-accent">
                  {formatCurrency(s.amount)}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
