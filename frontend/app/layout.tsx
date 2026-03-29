'use client'

import './globals.css'
import { Barlow, Inter } from 'next/font/google'

const barlow = Barlow({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <body className="bg-background font-dm text-cream min-h-screen">
        {children}
      </body>
    </html>
  )
}
