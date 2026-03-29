'use client'

interface Hall {
  id: string
  name: string
}

interface Props {
  halls: Hall[]
  selected: string
  onSelect: (id: string) => void
}

export default function HallSelector({ halls, selected, onSelect }: Props) {
  return (
    <div className="relative w-full">
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-cream font-dm text-sm appearance-none focus:outline-none focus:border-amber transition-colors cursor-pointer"
      >
        {halls.map((hall) => (
          <option key={hall.id} value={hall.id} className="bg-surface text-cream">
            {hall.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted text-xs">▼</div>
    </div>
  )
}
