export type Member = {
  id: string
  name: string
}

export type SplitMode = 'equal' | 'custom'

export type Expense = {
  id: string
  description: string
  amount: number
  paidById: string
  splitMode: SplitMode
  participantIds: string[]
  customSplits: Record<string, number>
}

export type Settlement = {
  fromId: string
  toId: string
  amount: number
}

export type MemberBalance = {
  memberId: string
  paid: number
  owed: number
  net: number
}
