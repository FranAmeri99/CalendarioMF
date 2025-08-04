'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeRegistry } from './ThemeRegistry'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeRegistry>
        {children}
        <Toaster position="top-right" />
      </ThemeRegistry>
    </SessionProvider>
  )
} 