'use client'

import { motion } from 'framer-motion'
import AnimatedNumber from './AnimatedNumber'
import MacroRing from './MacroRing'

interface MacroStat {
  current: number
  target: number
}

interface Props {
  consumed: number
  goal: number
  protein: MacroStat
  carbs: MacroStat
  fat: MacroStat
}

export default function CalorieHero({ consumed, goal, protein, carbs, fat }: Props) {
  const remaining = goal - consumed
  const progressPct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0

  return (
    <div className="bg-surface border border-border rounded-3xl p-6">
      {/* Label */}
      <div className="font-dm text-muted text-sm mb-1">Today&apos;s Plan</div>

      {/* Plan calories */}
      <div className="font-syne font-extrabold text-cream text-5xl leading-none">
        <AnimatedNumber value={consumed} />
      </div>
      <div className="text-muted text-sm mt-1">of {goal} kcal daily goal</div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-amber"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* Macro rings */}
      <div className="mt-5 flex flex-row justify-center gap-6">
        <MacroRing
          current={protein.current}
          target={protein.target}
          color="#009CDE"
          label="Protein"
        />
        <MacroRing
          current={carbs.current}
          target={carbs.target}
          color="#4DAFD4"
          label="Carbs"
        />
        <MacroRing
          current={fat.current}
          target={fat.target}
          color="#7BA3D4"
          label="Fat"
        />
      </div>
    </div>
  )
}
