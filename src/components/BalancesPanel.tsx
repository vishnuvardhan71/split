import type { Member, MemberBalance } from '../types'
import { formatCurrency } from '../utils/calculations'

type Props = {
  members: Member[]
  balances: MemberBalance[]
}

export function BalancesPanel({ members, balances }: Props) {
  const nameById = Object.fromEntries(members.map((m) => [m.id, m.name]))

  return (
    <section className="rounded-2xl border border-border bg-surface-raised p-5 shadow-lg">
      <h2 className="text-lg font-semibold text-text">Net Balances</h2>
      <p className="mt-1 text-sm text-text-muted">
        Paid minus owed — green means others owe them
      </p>

      {balances.length === 0 ? (
        <p className="mt-6 text-center text-sm text-text-muted">
          Add members and expenses to see balances
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {balances.map((b) => {
            const isPositive = b.net > 0.01
            const isNegative = b.net < -0.01
            const isZero = !isPositive && !isNegative

            return (
              <li
                key={b.memberId}
                className="rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-text">
                    {nameById[b.memberId]}
                  </span>
                  <span
                    className={`text-lg font-bold tabular-nums ${
                      isPositive
                        ? 'text-positive'
                        : isNegative
                          ? 'text-negative'
                          : 'text-text-muted'
                    }`}
                  >
                    {isZero
                      ? 'Settled'
                      : `${isPositive ? '+' : ''}${formatCurrency(b.net)}`}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-text-muted">
                  <span>Paid {formatCurrency(b.paid)}</span>
                  <span>Owed {formatCurrency(b.owed)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
