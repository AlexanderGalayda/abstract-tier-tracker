'use client'

import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        isDark ? 'bg-[#2b2f36]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] leading-none shadow transition-transform duration-200 ${
          isDark ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
