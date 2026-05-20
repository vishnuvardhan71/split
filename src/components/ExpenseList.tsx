import type { Expense, Member } from '../types'
import { formatCurrency, getExpenseShares } from '../utils/calculations'

type Props = {
  members: Member[]
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ members, expenses, onEdit, onDelete }: Props) {
  const nameById = Object.fromEntries(members.map((m) => [m.id, m.name]))

  return (
    <section className="rounded-2xl border border-border bg-surface-raised p-5 shadow-lg">
      <h2 className="text-lg font-semibold text-text">Expenses</h2>
      <p className="mt-1 text-sm text-text-muted">
        {expenses.length} recorded
      </p>

      {expenses.length === 0 ? (
        <p className="mt-6 text-center text-sm text-text-muted">
          No expenses yet — add one above
        </p>
      ) : (
        <ul className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {expenses.map((exp) => {
            const shares = getExpenseShares(exp)
            const shareLines = Object.entries(shares)
              .filter(([, amt]) => amt > 0)
              .map(
                ([id, amt]) =>
                  `${nameById[id]}: ${formatCurrency(amt)}`,
              )

            return (
              <li
                key={exp.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-text">
                      {exp.description}
                    </h3>
                    <p className="mt-0.5 text-lg font-bold text-accent">
                      {formatCurrency(exp.amount)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(exp)}
                      className="rounded-md px-2 py-1 text-xs text-text-muted transition hover:bg-surface-muted hover:text-text"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(exp.id)}
                      className="rounded-md px-2 py-1 text-xs text-text-muted transition hover:bg-surface-muted hover:text-negative"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-sm text-text-muted">
                  Paid by{' '}
                  <span className="font-medium text-text">
                    {nameById[exp.paidById]}
                  </span>
                  {' · '}
                  <span className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">
                    {exp.splitMode === 'equal' ? 'Equal' : 'Custom'}
                  </span>
                </p>

                {shareLines.length > 0 && (
                  <p className="mt-1.5 text-xs text-text-muted">
                    Split: {shareLines.join(', ')}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {expenses.length > 0 && (
        <p className="mt-4 border-t border-border pt-3 text-sm font-semibold text-text">
          Total spent:{' '}
          <span className="text-accent">
            {formatCurrency(
              expenses.reduce((sum, e) => sum + e.amount, 0),
            )}
          </span>
        </p>
      )}
    </section>
  )
}
