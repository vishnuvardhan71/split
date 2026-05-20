import type { Expense, Member, MemberBalance, Settlement } from '../types'

const EPSILON = 0.01

export function getExpenseShares(expense: Expense): Record<string, number> {
  const shares: Record<string, number> = {}

  if (expense.splitMode === 'equal') {
    const count = expense.participantIds.length
    if (count === 0) return shares
    const each = expense.amount / count
    for (const id of expense.participantIds) {
      shares[id] = each
    }
    return shares
  }

  return { ...expense.customSplits }
}

export function computeBalances(
  members: Member[],
  expenses: Expense[],
): MemberBalance[] {
  const paid: Record<string, number> = {}
  const owed: Record<string, number> = {}

  for (const m of members) {
    paid[m.id] = 0
    owed[m.id] = 0
  }

  for (const expense of expenses) {
    if (paid[expense.paidById] !== undefined) {
      paid[expense.paidById] += expense.amount
    }
    const shares = getExpenseShares(expense)
    for (const [memberId, share] of Object.entries(shares)) {
      if (owed[memberId] !== undefined) {
        owed[memberId] += share
      }
    }
  }

  return members.map((m) => ({
    memberId: m.id,
    paid: paid[m.id] ?? 0,
    owed: owed[m.id] ?? 0,
    net: (paid[m.id] ?? 0) - (owed[m.id] ?? 0),
  }))
}

/** Greedy minimum-cash-flow settlement matching. */
export function computeSettlements(balances: MemberBalance[]): Settlement[] {
  type Bucket = { id: string; amount: number }

  const creditors: Bucket[] = []
  const debtors: Bucket[] = []

  for (const { memberId, net } of balances) {
    if (net > EPSILON) creditors.push({ id: memberId, amount: net })
    else if (net < -EPSILON) debtors.push({ id: memberId, amount: -net })
  }

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const settlements: Settlement[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    if (pay > EPSILON) {
      settlements.push({
        fromId: debtors[i].id,
        toId: creditors[j].id,
        amount: Math.round(pay * 100) / 100,
      })
    }
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount < EPSILON) i++
    if (creditors[j].amount < EPSILON) j++
  }

  return settlements
}

export function customSplitsSum(splits: Record<string, number>): number {
  return Object.values(splits).reduce((a, b) => a + b, 0)
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function generateId(): string {
  return crypto.randomUUID()
}
