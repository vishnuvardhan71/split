import { useMemo, useState } from 'react'
import { BalancesPanel } from './components/BalancesPanel'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import { MembersPanel } from './components/MembersPanel'
import { SettlementPanel } from './components/SettlementPanel'
import type { Expense, Member } from './types'
import {
  computeBalances,
  computeSettlements,
  generateId,
} from './utils/calculations'

const DEMO_MEMBERS: Member[] = [
  { id: 'demo-a', name: 'A' },
  { id: 'demo-b', name: 'B' },
  { id: 'demo-c', name: 'C' },
]

function buildDemoExpenses(): Expense[] {
  return [
    {
      id: generateId(),
      description: 'Expense 1 (paid by A)',
      amount: 25,
      paidById: 'demo-a',
      splitMode: 'equal',
      participantIds: ['demo-a', 'demo-b', 'demo-c'],
      customSplits: {},
    },
    {
      id: generateId(),
      description: 'Expense 2 (paid by B)',
      amount: 20,
      paidById: 'demo-b',
      splitMode: 'equal',
      participantIds: ['demo-a', 'demo-b', 'demo-c'],
      customSplits: {},
    },
    {
      id: generateId(),
      description: 'Expense 3 (paid by A)',
      amount: 45,
      paidById: 'demo-a',
      splitMode: 'equal',
      participantIds: ['demo-a', 'demo-b', 'demo-c'],
      customSplits: {},
    },
  ]
}

export default function App() {
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newMemberName, setNewMemberName] = useState('')
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const balances = useMemo(
    () => computeBalances(members, expenses),
    [members, expenses],
  )
  const settlements = useMemo(
    () => computeSettlements(balances),
    [balances],
  )

  const addMember = () => {
    const name = newMemberName.trim()
    if (!name) return
    if (members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      return
    }
    setMembers((prev) => [...prev, { id: generateId(), name }])
    setNewMemberName('')
  }

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setExpenses((prev) =>
      prev.filter((e) => e.paidById !== id && !e.participantIds.includes(id)),
    )
    if (editingExpense?.paidById === id) setEditingExpense(null)
  }

  const saveExpense = (expense: Expense) => {
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e.id === expense.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = expense
        return next
      }
      return [...prev, expense]
    })
    setEditingExpense(null)
  }

  const loadDemo = () => {
    setMembers(DEMO_MEMBERS)
    setExpenses(buildDemoExpenses())
    setEditingExpense(null)
  }

  const clearAll = () => {
    setMembers([])
    setExpenses([])
    setEditingExpense(null)
    setNewMemberName('')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface-raised/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
              Split Expense Tracker
            </h1>
            <p className="text-sm text-text-muted">
              Split bills fairly and settle up with minimum payments
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadDemo}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition hover:border-accent hover:text-accent"
            >
              Load demo (A, B, C)
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition hover:border-negative hover:text-negative"
            >
              Clear all
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <MembersPanel
            members={members}
            newName={newMemberName}
            onNewNameChange={setNewMemberName}
            onAdd={addMember}
            onRemove={removeMember}
          />
        </div>

        <div className="space-y-6">
          <ExpenseForm
            members={members}
            editing={editingExpense}
            onSave={saveExpense}
            onCancelEdit={() => setEditingExpense(null)}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <ExpenseList
              members={members}
              expenses={expenses}
              onEdit={setEditingExpense}
              onDelete={(id) => {
                setExpenses((prev) => prev.filter((e) => e.id !== id))
                if (editingExpense?.id === id) setEditingExpense(null)
              }}
            />
            <div className="space-y-6">
              <BalancesPanel members={members} balances={balances} />
              <SettlementPanel
                members={members}
                settlements={settlements}
                hasExpenses={expenses.length > 0}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
