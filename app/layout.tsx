import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Incense Timer',
  description: 'A minimalist productivity timer inspired by Japanese incense rituals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
