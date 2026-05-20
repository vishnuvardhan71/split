import type { Member } from '../types'

type Props = {
  members: Member[]
  newName: string
  onNewNameChange: (value: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

export function MembersPanel({
  members,
  newName,
  onNewNameChange,
  onAdd,
  onRemove,
}: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd()
  }

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-border bg-surface-raised p-5 shadow-lg">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text">Group Members</h2>
        <p className="mt-1 text-sm text-text-muted">
          Add everyone sharing these expenses
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => onNewNameChange(e.target.value)}
          placeholder="Name"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface transition hover:bg-accent-hover"
        >
          Add
        </button>
      </form>

      <ul className="flex-1 space-y-2 overflow-y-auto">
        {members.length === 0 ? (
          <li className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-text-muted">
            No members yet
          </li>
        ) : (
          members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5"
            >
              <span className="font-medium text-text">{m.name}</span>
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="rounded-md px-2 py-1 text-xs text-text-muted transition hover:bg-surface-muted hover:text-negative"
                aria-label={`Remove ${m.name}`}
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>

      <p className="mt-4 text-xs text-text-muted">
        {members.length} member{members.length !== 1 ? 's' : ''}
      </p>
    </aside>
  )
}
