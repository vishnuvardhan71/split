import type { Expense, Member, SplitMode } from '../types'

const STORAGE_KEY = 'split-expense-tracker-data'

type StoredData = {
  members: Member[]
  expenses: Expense[]
}

function isSplitMode(value: unknown): value is SplitMode {
  return value === 'equal' || value === 'custom'
}

function isMember(value: unknown): value is Member {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Member).id === 'string' &&
    typeof (value as Member).name === 'string'
  )
}

function isExpense(value: unknown): value is Expense {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Expense
  return (
    typeof e.id === 'string' &&
    typeof e.description === 'string' &&
    typeof e.amount === 'number' &&
    typeof e.paidById === 'string' &&
    isSplitMode(e.splitMode) &&
    Array.isArray(e.participantIds) &&
    e.participantIds.every((id) => typeof id === 'string') &&
    typeof e.customSplits === 'object' &&
    e.customSplits !== null
  )
}

function parseStoredData(raw: string): StoredData | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const { members, expenses } = parsed as StoredData
    if (!Array.isArray(members) || !Array.isArray(expenses)) return null
    if (!members.every(isMember) || !expenses.every(isExpense)) return null
    return { members, expenses }
  } catch {
    return null
  }
}

export function loadStoredData(): StoredData {
  if (typeof window === 'undefined') {
    return { members: [], expenses: [] }
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { members: [], expenses: [] }
  return parseStoredData(raw) ?? { members: [], expenses: [] }
}

export function saveStoredData(data: StoredData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearStoredData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
