import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MemberBalance } from '../types'

type Props = {
  balances: MemberBalance[]
  members: { id: string; name: string }[]
  onClose: () => void
}

export function ChartPanel({ balances, members, onClose }: Props) {
  const nameById = Object.fromEntries(members.map((m) => [m.id, m.name]))

  const data = balances.map((b) => ({
    name: nameById[b.memberId] || 'Unknown',
    Paid: b.paid,
    Owed: b.owed,
  }))

  if (balances.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-3xl rounded-2xl bg-surface p-6 shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text">Activity Overview</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
          </div>
          <p className="text-text-muted text-center py-10">No expenses recorded yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl bg-surface p-6 shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text">Activity Overview</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ fontSize: '14px' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
              <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Owed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
