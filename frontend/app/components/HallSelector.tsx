'use client'

import { motion } from 'framer-motion'

interface Hall {
  id: string
  name: string
}

interface Props {
  halls: Hall[]
  selected: string
  onSelect: (id: string) => void
}

function shortenName(name: string): string {
  // Strip "UP: " prefix
  let n = name.replace(/^UP:\s*/i, '')
  // Keep only first part before "@"
  const atIdx = n.indexOf('@')
  if (atIdx !== -1) {
    n = n.substring(0, atIdx).trim()
  }
  return n
}

export default function HallSelector({ halls, selected, onSelect }: Props) {
  return (
    <div className="overflow-x-auto no-scrollbar flex gap-2 pb-1">
      {halls.map((hall) => (
        <motion.button
          key={hall.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(hall.id)}
          className={`font-dm font-medium text-sm px-4 py-2 rounded-full border whitespace-nowrap flex-shrink-0 transition-colors ${
            selected === hall.id
              ? 'bg-amber text-background border-amber'
              : 'bg-surface text-cream border-border'
          }`}
        >
          {shortenName(hall.name)}
        </motion.button>
      ))}
    </div>
  )
}
