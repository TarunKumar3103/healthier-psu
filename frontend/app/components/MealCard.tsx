'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlanItem } from '../types'

interface Props {
  meal: PlanItem
  onAdd: (meal: PlanItem) => void
  index: number
  forceAdded?: boolean
}

function getEmoji(name: string): string {
  const n = name.toLowerCase()
  if (/beef|chicken|pork|steak|turkey|meat|bacon|sausage|brisket|wing/.test(n)) return '🥩'
  if (/salad|greens|lettuce|kale|spinach|arugula/.test(n)) return '🥗'
  if (/pizza/.test(n)) return '🍕'
  if (/pasta|noodle|spaghetti|mac|penne|linguine|fettuccine/.test(n)) return '🍜'
  if (/egg|omelet|frittata|quiche/.test(n)) return '🥚'
  if (/burger|sandwich|wrap|sub|hoagie/.test(n)) return '🍔'
  if (/vegan|vegetarian|tofu|tempeh|lentil|bean/.test(n)) return '🥦'
  if (/fish|salmon|tuna|tilapia|cod|shrimp|seafood|crab|lobster/.test(n)) return '🐟'
  return '🍳'
}

export default function MealCard({ meal, onAdd, index, forceAdded }: Props) {
  const [added, setAdded] = useState(false)

  const isAdded = forceAdded ?? added

  function handleAdd() {
    if (isAdded) return
    setAdded(true)
    onAdd(meal)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      whileHover={!isAdded ? { y: -2 } : {}}
      className={`relative bg-surface rounded-2xl p-4 flex items-center gap-3 overflow-hidden transition-all border ${
        isAdded ? 'border-green-accent/40' : 'border-border hover:border-amber/40'
      }`}
    >
      {/* Left accent strip */}
      <AnimatePresence>
        {isAdded && (
          <motion.div
            key="strip"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-accent rounded-r-full origin-center"
          />
        )}
      </AnimatePresence>

      {/* Emoji tile */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-colors ${
          isAdded ? 'bg-green-accent/15' : 'bg-border'
        }`}
      >
        {getEmoji(meal.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-dm font-medium text-cream text-sm truncate">{meal.name}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {meal.calories !== null && (
            <span className="font-syne font-bold text-amber text-sm">{meal.calories} kcal</span>
          )}
          {meal.protein_g !== null && (
            <span className="text-green-accent text-xs">{meal.protein_g}g protein</span>
          )}
        </div>
        {meal.station && (
          <div className="text-muted text-xs mt-0.5 truncate">{meal.station}</div>
        )}
      </div>

      {/* Add button */}
      <motion.button
        whileTap={!isAdded ? { scale: 0.93 } : {}}
        onClick={handleAdd}
        disabled={isAdded}
        className={`flex-shrink-0 h-8 rounded-lg text-xs font-dm font-semibold flex items-center gap-1.5 px-3 transition-all border ${
          isAdded
            ? 'bg-green-accent/10 border-green-accent/30 text-green-accent cursor-default'
            : 'bg-amber/10 border-amber/40 text-amber hover:bg-amber hover:text-background'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L3.8 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Added
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}
