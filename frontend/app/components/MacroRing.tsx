'use client'

import { motion } from 'framer-motion'

interface Props {
  current: number
  target: number
  color: string
  label: string
  unit?: string
}

export default function MacroRing({ current, target, color, label, unit = 'g' }: Props) {
  const size = 80
  const strokeWidth = 8
  const r = 34
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const ratio = target > 0 ? Math.min(current / target, 1) : 0

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1A3A6B"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Animated fill */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - ratio) }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        {/* Center label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ fontSize: 10 }}
        >
          <span className="font-syne font-bold" style={{ color, fontSize: 11, lineHeight: 1 }}>
            {Math.round(current)}
          </span>
          <span className="text-muted" style={{ fontSize: 8 }}>{unit}</span>
        </div>
      </div>
      <div className="font-syne text-xs text-center">
        <div className="text-cream" style={{ fontSize: 10 }}>
          {Math.round(current)}{unit} / {Math.round(target)}{unit}
        </div>
        <div className="text-muted" style={{ fontSize: 9 }}>{label}</div>
      </div>
    </div>
  )
}
