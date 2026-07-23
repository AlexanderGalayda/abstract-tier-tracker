'use client'

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

const listeners = new Set<() => void>()

// useSyncExternalStore's whole purpose is "external state that can legitimately
// differ between server and client" — it renders getServerSnapshot() on the
// server AND on the client's first hydration pass (guaranteeing no mismatch),
// then re-renders with the real getSnapshot() right after. That's exactly
// this case: the server has no access to localStorage, but the inline script
// in layout.tsx already set the `dark` class on <html> before hydration, so
// the page's actual colors are correct from first paint regardless — this
// only drives JS-level theme awareness (the toggle icon, Recharts colors).
function getSnapshot(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function getServerSnapshot(): Theme {
  return 'light'
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

function setDomTheme(next: Theme) {
  document.documentElement.classList.toggle('dark', next === 'dark')
  try {
    localStorage.setItem('theme', next)
  } catch {
    // localStorage can throw in private-browsing/blocked-storage contexts — theme
    // still applies for this session, it just won't persist across reloads.
  }
  listeners.forEach((listener) => listener())
}

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'light',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggleTheme() {
    setDomTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
