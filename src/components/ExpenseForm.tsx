import { useEffect, useState } from 'react'
import type { Expense, Member, SplitMode } from '../types'
import { customSplitsSum, generateId } from '../utils/calculations'

export type ExpenseFormValues = {
  description: string
  amount: string
  date: string
  paidById: string
  splitMode: SplitMode
  participantIds: string[]
  customSplits: Record<string, string>
}

type Props = {
  members: Member[]
  editing: Expense | null
  onSave: (expense: Expense) => void
  onCancelEdit: () => void
}

function emptyForm(members: Member[]): ExpenseFormValues {
  const ids = members.map((m) => m.id)
  const customSplits: Record<string, string> = {}
  for (const id of ids) customSplits[id] = ''

  const now = new Date()
  const date = now.toISOString().split('T')[0]

  return {
    description: '',
    amount: '',
    date,
    paidById: ids[0] ?? '',
    splitMode: 'equal',
    participantIds: [...ids],
    customSplits,
  }
}

function expenseToForm(expense: Expense, members: Member[]): ExpenseFormValues {
  const customSplits: Record<string, string> = {}
  for (const m of members) {
    customSplits[m.id] =
      expense.customSplits[m.id] !== undefined
        ? String(expense.customSplits[m.id])
        : ''
  }
  return {
    description: expense.description,
    amount: String(expense.amount),
    date: expense.date,
    paidById: expense.paidById,
    splitMode: expense.splitMode,
    participantIds: [...expense.participantIds],
    customSplits,
  }
}

export function ExpenseForm({ members, editing, onSave, onCancelEdit }: Props) {
  const [form, setForm] = useState<ExpenseFormValues>(() => emptyForm(members))
  const [error, setError] = useState('')

  useEffect(() => {
    if (editing) {
      setForm(expenseToForm(editing, members))
    } else {
      setForm(emptyForm(members))
    }
    setError('')
  }, [editing, members])

  const amountNum = parseFloat(form.amount) || 0

  const toggleParticipant = (id: string) => {
    setForm((f) => {
      const has = f.participantIds.includes(id)
      const participantIds = has
        ? f.participantIds.filter((x) => x !== id)
        : [...f.participantIds, id]
      return { ...f, participantIds }
    })
  }

  const updateCustomSplit = (id: string, value: string) => {
    setForm((f) => ({
      ...f,
      customSplits: { ...f.customSplits, [id]: value },
    }))
  }

  const splitEquallyAmongSelected = () => {
    const count = form.participantIds.length
    if (count === 0 || amountNum <= 0) return
    const each = (amountNum / count).toFixed(2)
    const customSplits: Record<string, string> = { ...form.customSplits }
    for (const m of members) {
      customSplits[m.id] = form.participantIds.includes(m.id) ? each : ''
    }
    setForm((f) => ({ ...f, customSplits }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.description.trim()) {
      setError('Enter a description')
      return
    }
    if (amountNum <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (!form.paidById) {
      setError('Select who paid')
      return
    }

    if (form.splitMode === 'equal') {
      if (form.participantIds.length === 0) {
        setError('Select at least one person to split with')
        return
      }
      onSave({
        id: editing?.id ?? generateId(),
        description: form.description.trim(),
        amount: amountNum,
        date: form.date,
        time: editing?.time ?? new Date().toTimeString().slice(0, 5),
        paidById: form.paidById,
        splitMode: 'equal',
        participantIds: form.participantIds,
        customSplits: {},
      })
      return
    }

    const customSplits: Record<string, number> = {}
    let sum = 0
    for (const m of members) {
      const raw = form.customSplits[m.id]?.trim()
      if (!raw) continue
      const val = parseFloat(raw)
      if (isNaN(val) || val < 0) {
        setError(`Invalid amount for ${m.name}`)
        return
      }
      if (val > 0) {
        customSplits[m.id] = val
        sum += val
      }
    }

    if (Object.keys(customSplits).length === 0) {
      setError('Enter at least one custom split amount')
      return
    }
    if (Math.abs(sum - amountNum) > 0.02) {
      setError(
        `Custom splits (${sum.toFixed(2)}) must equal total (${amountNum.toFixed(2)})`,
      )
      return
    }

    onSave({
      id: editing?.id ?? generateId(),
      description: form.description.trim(),
      amount: amountNum,
      date: form.date,
      time: editing?.time ?? new Date().toTimeString().slice(0, 5),
      paidById: form.paidById,
      splitMode: 'custom',
      participantIds: Object.keys(customSplits),
      customSplits,
    })
  }

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-raised p-6 text-center text-sm text-text-muted">
        Add group members before recording expenses
      </div>
    )
  }

  const customSum = customSplitsSum(
    Object.fromEntries(
      Object.entries(form.customSplits).map(([k, v]) => [
        k,
        parseFloat(v) || 0,
      ]),
    ),
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface-raised p-5 shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">
          {editing ? 'Edit Expense' : 'Add Expense'}
        </h2>
        {editing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm text-text-muted hover:text-text"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-text-muted">
            Description
          </span>
          <input
            type="text"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Dinner, groceries, rent..."
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-muted">
            Total amount (₹)
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                e.preventDefault()
              }
            }}
            placeholder="0"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-muted">
            Date
          </span>
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>



        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-muted">
            Paid by
          </span>
          <select
            value={form.paidById}
            onChange={(e) =>
              setForm((f) => ({ ...f, paidById: e.target.value }))
            }
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-medium text-text-muted">
          Split mode
        </span>
        <div className="flex gap-2">
          {(['equal', 'custom'] as SplitMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setForm((f) => ({ ...f, splitMode: mode }))}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                form.splitMode === mode
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border text-text-muted hover:border-text-muted'
              }`}
            >
              {mode === 'equal' ? 'Equal split' : 'Custom split'}
            </button>
          ))}
        </div>
      </div>

      {form.splitMode === 'equal' ? (
        <div className="mt-4">
          <span className="mb-2 block text-xs font-medium text-text-muted">
            Split equally among
          </span>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const selected = form.participantIds.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleParticipant(m.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    selected
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-border text-text-muted hover:border-text-muted'
                  }`}
                >
                  {m.name}
                </button>
              )
            })}
          </div>
          {form.participantIds.length > 0 && amountNum > 0 && (
            <p className="mt-2 text-xs text-text-muted">
              Each pays ₹{(amountNum / form.participantIds.length).toFixed(2)}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Amount each person owes
            </span>
            <button
              type="button"
              onClick={splitEquallyAmongSelected}
              className="text-xs text-accent hover:underline"
            >
              Distribute from selection
            </button>
          </div>
          <div className="mb-2 flex flex-wrap gap-2">
            {members.map((m) => {
              const selected = form.participantIds.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleParticipant(m.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition ${
                    selected
                      ? 'border-accent/50 text-accent'
                      : 'border-border text-text-muted'
                  }`}
                >
                  {m.name}
                </button>
              )
            })}
          </div>
          <div className="space-y-2">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-text">{m.name}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.customSplits[m.id] ?? ''}
                  onChange={(e) => updateCustomSplit(m.id, e.target.value)}
                  placeholder="0"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
            ))}
          </div>
          {amountNum > 0 && (
            <p
              className={`mt-2 text-xs ${
                Math.abs(customSum - amountNum) <= 0.02
                  ? 'text-positive'
                  : 'text-negative'
              }`}
            >
              Sum: ₹{customSum.toFixed(2)} / ₹{amountNum.toFixed(2)}
              {Math.abs(customSum - amountNum) <= 0.02 ? ' ✓' : ' — must match'}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-negative" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-surface transition hover:bg-accent-hover sm:w-auto sm:px-8"
      >
        {editing ? 'Save changes' : 'Add expense'}
      </button>
    </form>
  )
}
