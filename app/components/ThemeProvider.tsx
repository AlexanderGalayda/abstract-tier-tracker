'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'light',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always starts 'light', matching what the server renders with no access to
  // localStorage — this guarantees the first client render can't mismatch
  // hydration (a real mismatch here is severe enough that React discards and
  // regenerates the tree, which is worse than one harmless correction below).
  // The page's actual dark colors don't wait on this: the inline script in
  // layout.tsx already set the `dark` class on <html> before hydration, so
  // CSS `dark:` variants are correct from first paint regardless of this
  // state. This only drives JS-level theme awareness (the toggle icon,
  // Recharts colors), which corrects itself a moment after mount.
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark')
    }
  }, [])

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      try {
        localStorage.setItem('theme', next)
      } catch {
        // localStorage can throw in private-browsing/blocked-storage contexts — theme
        // still applies for this session, it just won't persist across reloads.
      }
      return next
    })
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
