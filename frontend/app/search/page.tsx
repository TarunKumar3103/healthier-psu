'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlanItem } from '../types'
import BottomNav from '../components/BottomNav'
import SidebarNav from '../components/SidebarNav'
import SkeletonCard from '../components/SkeletonCard'

const API = 'http://localhost:8000'

const FILTER_OPTIONS = ['High Protein', 'Low Carb', 'Low Cal', 'Vegetarian'] as const
type FilterOption = (typeof FILTER_OPTIONS)[number]

const MEAT_KEYWORDS = /beef|chicken|pork|steak|turkey|bacon|sausage|brisket|lamb|veal|ham|pepperoni/i

function estimateCarbs(m: PlanItem): number {
  const cal = m.calories ?? 0
  const prot = m.protein_g ?? 0
  return ((cal - prot * 4) * 0.58) / 4
}

function estimateFat(m: PlanItem): number {
  const cal = m.calories ?? 0
  const prot = m.protein_g ?? 0
  return ((cal - prot * 4) * 0.42) / 9
}

function applyFilters(meals: PlanItem[], filters: FilterOption[], query: string): PlanItem[] {
  return meals.filter((m) => {
    if (query && !m.name.toLowerCase().includes(query.toLowerCase())) return false
    if (filters.includes('High Protein') && (m.protein_g ?? 0) <= 20) return false
    if (filters.includes('Low Carb') && estimateCarbs(m) >= 30) return false
    if (filters.includes('Low Cal') && (m.calories ?? 9999) >= 400) return false
    if (filters.includes('Vegetarian') && MEAT_KEYWORDS.test(m.name)) return false
    return true
  })
}

function MacroBar({ meal }: { meal: PlanItem }) {
  const cal = meal.calories ?? 0
  const prot = meal.protein_g ?? 0
  const protKcal = prot * 4
  const carbKcal = (cal - protKcal) * 0.58
  const fatKcal = (cal - protKcal) * 0.42
  const total = protKcal + carbKcal + fatKcal || 1

  return (
    <div className="h-2 rounded-full overflow-hidden flex">
      <div
        className="h-full bg-green-accent"
        style={{ width: `${(protKcal / total) * 100}%` }}
      />
      <div
        className="h-full bg-amber"
        style={{ width: `${(carbKcal / total) * 100}%` }}
      />
      <div
        className="h-full bg-coral"
        style={{ width: `${(fatKcal / total) * 100}%` }}
      />
    </div>
  )
}

function SearchMealCard({ meal, index }: { meal: PlanItem; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const carbs = Math.round(estimateCarbs(meal))
  const fat = Math.round(estimateFat(meal))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full p-4 text-left flex items-center gap-3"
      >
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
        <span className="text-muted text-xs ml-2">{expanded ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border pt-3 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2 text-xs font-dm">
                <div className="flex justify-between">
                  <span className="text-muted">Calories</span>
                  <span className="text-cream">{meal.calories ?? '—'} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Protein</span>
                  <span className="text-green-accent">{meal.protein_g ?? '—'}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Est. Carbs</span>
                  <span className="text-amber">{carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Est. Fat</span>
                  <span className="text-coral">{fat}g</span>
                </div>
              </div>

              {/* Macro bar */}
              <MacroBar meal={meal} />

              {meal.allergens.length > 0 && (
                <div className="text-xs text-muted">
                  <span className="font-medium">Allergens: </span>
                  {meal.allergens.join(', ')}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterOption[]>([])
  const [allMeals, setAllMeals] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calories_target: 2200,
        protein_target: 150,
        vegetarian: false,
        avoid_allergens: [],
        protein_priority: 0.75,
        location_id: '0',
        goal_type: 'physique',
        food_preferences: [],
      }),
    })
      .then((r) => r.json())
      .then((j) => {
        const items: PlanItem[] = []
        if (j.meals) {
          const periods = ['breakfast', 'lunch', 'dinner', 'extras'] as const
          for (const period of periods) {
            const section = j.meals[period]
            if (section?.items) items.push(...section.items)
          }
        }
        setAllMeals(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function toggleFilter(f: FilterOption) {
    setFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    )
  }

  const filtered = applyFilters(allMeals, filters, query)

  return (
    <div className="bg-background min-h-screen">
      <SidebarNav active="search" />

      <main className="md:pl-20 lg:pl-56 pb-24 md:pb-8">
        {/* Sticky search header */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-syne font-bold text-cream text-xl mb-3">Search Meals</h1>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-cream font-dm text-sm focus:outline-none focus:border-amber transition-colors placeholder:text-muted"
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4">
          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-dm font-medium border transition-colors ${
                  filters.includes(f)
                    ? 'bg-amber text-background border-amber'
                    : 'bg-surface text-muted border-border hover:text-cream'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Result count */}
          {!loading && (
            <div className="text-muted text-xs font-dm">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Meal grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((meal, i) => (
                <SearchMealCard key={meal.mid} meal={meal} index={i} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-muted text-sm py-12">
                  No meals match your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav active="search" />
    </div>
  )
}
