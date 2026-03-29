'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const done = localStorage.getItem('psu_onboarding_done')
    const session = localStorage.getItem('psu_session')
    if (done && session) {
      router.replace('/dashboard')
    } else {
      router.replace('/onboarding')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-amber border-t-transparent animate-spin" />
    </div>
  )
}
